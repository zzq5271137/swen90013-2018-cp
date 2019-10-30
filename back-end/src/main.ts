import express, { Response } from 'express'
import bodyParser from 'body-parser'
import ldapStrategy from 'passport-ldapauth'
import passport from 'passport'
import cookieSession from 'cookie-session'
import request from 'request'
import multer from 'multer'

/**
 * testing utility functions
 */
var bypassAuth = false
export const BypassAuth = (value:boolean) => bypassAuth = value
var bypassLogging = false
export const BypassLogging = (value:boolean) => bypassLogging = value
export const Log = (message:string) => {
  if(bypassLogging) return
  console.log(message)
}

/**
 * api request types
 */
export interface User { 
  uid: string 
}
export type ProposalStatus = "approved" | "reject" | "new"
export interface Proposal extends MaybeId {
  name:string
  status: ProposalStatus
  outlineOfProject: string
  endProductBenefits: string
  endProductUse: string
  beneficiaries: string
  originality: string
  clientId: string
  subjectId?: string
  date?: string
  notes: ProposalNote[]
}
export interface ProposalNote {
  date: string
  text: string
  userName:string
}
export interface Product extends MaybeId {
  name:string
  deployed: boolean
  activelyUsed: boolean
  projectId: string
  productLinks: string[]
  document: string
  media: string
  technologies: string[] 
  students: Student[]
}
export interface Student {
  name: string
  email: string
}

export type HasClientId = { clientId:string }
export type HasProposalId = { proposalId:string }
export type HasCoordinatorId = { coordinatorId:string }
export type ProposalDetail = Proposal & { client:Client }
export type ProjectStatus = "new" | "inProgress" | "completed"
export interface Project extends MaybeId {
  name: string
  status: ProjectStatus
  supervisorId?: string
  subjectId?:string
  proposalId: string
  isInternal: boolean
  dateCreated: string
}
export type ProjectDetail = Project & { proposal:ProposalDetail } & { products:Product[] }
export interface Supervisor extends MaybeId {
  firstName: string
  lastName: string
  email: string
  contactNumber: string
  officeLocation: string
  subjectId: string
}
export interface Subject extends MaybeId {
  name: string
  coordinatorId: string
}
export interface Client extends MaybeId {
  firstName: string
  lastName: string
  email: string
  contactNumber: string
  technicalAbility: string
  secondaryContactFirstName: string
  secondaryContactLastName: string
  secondaryContactEmail: string
  secondaryContactNumber: string
  flag?: boolean
  organisation: Organisation
  notes: string[]
}
export interface Organisation {
  name: string
  size: string
  industryType: string
  description: string
  number: number
}
export interface MaybeId {
  _id?: string
}
export interface HasId {
  _id:string
}
export interface SubmitProposal {
  firstName:string
  lastName:string
  email:string
  number: string
  secondaryContactFirstName: string
  secondaryContactLastName: string
  secondaryContactEmail: string
  secondaryContactContactNumber: string
  officeNumber: string
  technical: string
  organisationName: string
  industryType: string
  size: string
  organisationBrief: string
  projectName: string
  outline: string
  beneficiaries: string
  benefits: string
  original: string
  used: string
}
export interface AcceptProposal {
  subjectId:string
  acceptReason: string
  userName:string
}
export interface RejectProposal {
  rejectReason: string
  userName:string
}

/**
 * user is serialised for use in cookie session token
 */
passport.serializeUser((user:User, done) => {
  done(null, user.uid)
})
passport.deserializeUser((id, done) => {
  done(null, id)
})
const ldapOptions : ldapStrategy.Options = {
  server: {
    url: 'ldaps://centaur.unimelb.edu.au/',
    searchBase: 'ou=people, o=unimelb',
    searchFilter: '(uid={{username}})'
  }
}
passport.use(new ldapStrategy(ldapOptions))
const app = express()

/**
 * express web server middleware - auth, cors, json request body parsing
 */
var cors = require('cors')
app.use(cors({credentials: true, origin: true}))
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000, //1day in milliseconds
  keys: ['randomkey']
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(passport.initialize())
app.use(passport.session())
/**
 * checks for authentication for all routes except login
 * logs routes
 */
/* 
app.use((req, res, next) => {
  if(req.url != '/api/login' && req.isUnauthenticated() && !bypassAuth) return res.status(401).send("user is not authenticated")
  Log(`${req.method.toUpperCase()} ${req.url}`)
  next()
}) 
*/

/**
 * safe json parse
 */
function jsonParse<T>(item:any) : T | undefined {
  try {
    return JSON.parse(item)
  } catch {
    return undefined as any as T
  }
}

/**
 * config - microservice url's
 */
const userMicroserviceUrl = "http://35.244.89.250"
const projectMicroserviceUrl = "http://35.247.162.193"
const messageMicroserviceUrl = "http://35.197.167.244"
const port = 13000
export const Url = `http://localhost:${port}`

/**
 * http helper functions to reduce boilerplate code
 */
export const put = <T>(url:string, body:T) => {
  return new Promise<{} | undefined>((resolve, _) => { 
    request.put(url, { json:body }, (err, res_, body_) => {
      if(err) return resolve(undefined)
      return resolve(body_)
    })
  })
}
export const post = <T, T1 extends {}>(url:string, body:T) => {
  return new Promise<T1 | undefined>((resolve, _) => { 
    request.post(url, { json:body }, (err, res_, body_) => {
      if(err) return resolve(undefined)
      return resolve(body_)
    })
  })
}
export const get = <T>(url:string) => {
  return new Promise<T | undefined>((resolve, _) => { 
    request.get(url, (err, res_, body_) => {
      if(err) return resolve(undefined)
      return resolve(body_ as T)
    })
  })
}

/**
 * auth routes
 */
app.post('/api/login', passport.authenticate('ldapauth'), (req, res:Response) => {
  res.status(200).json(req.user)
}) 

/**
 * project routes
 */
app.get('/api/project', async (req, res) => {
  //embed client into project. use proposal to obtain client
  const projects_ = await get<string>(`${projectMicroserviceUrl}/project`)
  if(!projects_) return res.status(400).send("get projects failed: project microservice returned undefined")
  const projects = jsonParse(projects_) as Project[]
  const projectDetails = await Promise.all(projects.map(async project => {
    const result = await addDetailsToProject(project)
    if(typeof result == "string") return project
    return result
  }))
  res.status(200).send(projectDetails)
})

app.post('/api/project', (req, res) => {
  const body = req.body
  request.post(`${projectMicroserviceUrl}/project`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})


async function addDetailsToProject(project:Project) : Promise<ProjectDetail | string> {
  try {
    if(!project) return "get project failed: project is undefined"
    const proposalId = project.proposalId
    if(!proposalId) return "get project failed: project does not have proposalId"
    const proposalString = await get<string>(`${projectMicroserviceUrl}/proposal/${project.proposalId}`)
    if(!proposalString) return "get project failed: project microservice returned undefined for proposal"
    const proposal = jsonParse(proposalString) as Proposal
    if(!proposal) return "get project failed: project microservice return invalid proposal"
    const clientId = proposal.clientId
    if(!clientId) return "get project failed: proposal does not have client id"
    const clientString = await get<string>(`${userMicroserviceUrl}/client/${clientId}`)
    if(!clientString) return "get project failed: user microservice returned undefined for client"
    const client = jsonParse(clientString) as Client
    const productsString = await get<string>(`${projectMicroserviceUrl}/product`)
    if(!productsString) return "get project failed: project microservice returned undefined for products"
    const products = jsonParse(productsString) as Product[]
    const products_ = products.filter(p => p.projectId == project._id)
    const projectDetail_ : ProjectDetail = {
      ...project,
      proposal: {
        ...proposal,
        client: client
      },
      products: products_
    }
    return projectDetail_
  } catch (e) {
    return `failed to get project details for project. ${e}`
  }
  
}

app.get('/api/project/:id', async (req, res) => {
  const id = req.params.id
  const project_ = await get<string>(`${projectMicroserviceUrl}/project/${id}`)
  if(!project_) return "get project failed: project microservice returned undefined for project"
  const project = jsonParse(project_) as Project
  const result = await addDetailsToProject(project)
  if(typeof result == "string") return res.status(400).send(result)
  return res.status(200).json(result)
})

app.put('/api/project/:id', (req, res) => {
  const id = req.params.id
  const body = req.body
  request.put(`${projectMicroserviceUrl}/project/${id}`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

/**
 * proposal routes
 */
app.get('/api/proposal', async (req, res) => {
  const proposals_ = await get<string>(`${projectMicroserviceUrl}/proposal`)
  if(!proposals_) return res.status(400).send("get proposals failed: project microservice returned undefined")
  const proposals = jsonParse(proposals_) as HasClientId[]
  const proposalDetails = await Promise.all(proposals.map(async proposal => {
    const clientId = proposal.clientId
    if(!clientId) return proposal
    const clientString = await get<string>(`${userMicroserviceUrl}/client/${proposal.clientId}`)
    if(!clientString) return proposal
    const client = jsonParse(clientString) as Client
    const proposalDetails_ = {
      ...proposal,
      client: client
    }
    return proposalDetails_
  }))
  res.status(200).send(proposalDetails)
})

app.post('/api/proposal', (req, res) => {
  const body = req.body
  request.post(`${projectMicroserviceUrl}/proposal`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

app.post('/api/proposal/:id/accept', async (req, res) => {
  const body = req.body as AcceptProposal
  if(!body) return res.status(400).send(`accept proposal failed: body of request does not contain correct info`)

  const proposalId = req.params.id
  
  //get proposal by id
  const proposalString = await get<string>(`${projectMicroserviceUrl}/proposal/${proposalId}`)
  if(!proposalString) return res.status(400).send(`accept proposal failed: could not find proposal with id ${proposalId}`)
  const proposal = jsonParse(proposalString) as Proposal

  //update proposal status field to approved
  const proposal_ : Proposal = { 
    ...proposal, 
    status:"approved", 
    notes:[ ...proposal.notes? proposal.notes: [], ({ text:body.acceptReason, date:`${Date.now()}`, userName:body.userName }) ],
    subjectId: body.subjectId
  }
  const updateProposal = await put(`${projectMicroserviceUrl}/proposal/${proposalId}`, proposal_)
  if(!updateProposal) return res.status(400).send(`accept proposal failed: could not update proposal with id ${proposalId}. setting status to approved, appending note and assigning subject`)

  //create project from proposal
  const project : Project = {
    name: proposal.name,
    status: "new",
    isInternal: false,
    proposalId: proposalId,
    //subjectId: body.subjectId
    dateCreated: new Date(Date.now()).toDateString()
  }
  const newProject = await post<Project, HasId>(`${projectMicroserviceUrl}/project`, project)
  if(!newProject) return res.status(400).send(`accept proposal failed: could not create project from proposal`)
  
  return res.status(200).json({
    projectId: newProject._id,
    proposal: proposal_
  })
})

app.post('/api/proposal/:id/reject', async (req, res) => {
  const body = req.body as RejectProposal
  if(!body) return res.status(400).send(`reject proposal failed: body of request does not contain correct info`)

  const proposalId = req.params.id
  
  //get proposal by id
  const proposalString = await get<string>(`${projectMicroserviceUrl}/proposal/${proposalId}`)
  if(!proposalString) return res.status(400).send(`reject proposal failed: could not find proposal with id ${proposalId}`)
  const proposal = jsonParse(proposalString) as Proposal

  //update proposal status field to reject
  const proposal_ : Proposal = { 
    ...proposal, 
    status:"reject", 
    notes:[ ...proposal.notes? proposal.notes: [], ({ date:`${Date.now()}`, text:body.rejectReason, userName:body.userName } as ProposalNote) ] 
  }
  const updateProposal = await put(`${projectMicroserviceUrl}/proposal/${proposalId}`, proposal_)
  if(!updateProposal) return res.status(400).send(`reject proposal failed: could not update status of proposal with id ${proposalId} to reject`)

  return res.status(200).json({
    proposal: proposal_
  })
})

app.post('/api/proposal/submit', async (req, res) => {
  const body = req.body as SubmitProposal

  //define client from request body params
  const client : Client = {
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    technicalAbility: body.technical,
    contactNumber: body.number,
    secondaryContactFirstName: body.secondaryContactFirstName,
    secondaryContactLastName: body.secondaryContactLastName,
    secondaryContactNumber: body.secondaryContactContactNumber,
    secondaryContactEmail: body.secondaryContactEmail,
    organisation: {
      name:  body.organisationName,
      industryType: body.industryType,
      description: body.organisationBrief,
      size: body.size,
      number: parseFloat(body.officeNumber)
    },
    notes: []
  }

  //create client from client info and get id
  const newClient = await post<Client, HasId>(`${userMicroserviceUrl}/client`, client)
  if(!newClient) return res.status(400).send(`submit proposal failed: could not create client`)

  //create proposal record
  const proposal : Proposal = {
    name: body.projectName,
    status: "new",
    outlineOfProject: body.outline,
    endProductBenefits: body.benefits,
    endProductUse: body.used,
    beneficiaries: body.beneficiaries,
    originality: body.original,
    clientId: newClient._id,
    notes: []
  }
  const newProposal = await post<Proposal, HasId>(`${projectMicroserviceUrl}/proposal`, proposal)
  if(!newProposal) return res.status(400).send(`submit proposal failed: could not create proposal`)
  
  res.status(200).json({
    clientId: newClient._id,
    proposalId: newProposal._id
  })

})

app.get('/api/proposal/:id', async (req, res) => {
  const id = req.params.id
  const proposal_ = await get<string>(`${projectMicroserviceUrl}/proposal/${id}`)
  if(!proposal_) return res.status(400).send("get proposal failed: project microservice returned undefined for proposal")
  const proposal = jsonParse(proposal_) as HasClientId
  const clientId = proposal.clientId
  if(!clientId) return proposal
  const clientString = await get<string>(`${userMicroserviceUrl}/client/${proposal.clientId}`)
  if(!clientString) return res.status(400).send("get proposal failed: user microservice returned undefined for client")
  const client = jsonParse(clientString)
  const proposalDetail_ = {
    ...proposal,
    client: client
  }
  return res.status(200).json(proposalDetail_)
})

app.put('/api/proposal/:id', (req, res) => {
  const id = req.params.id
  const body = req.body
  request.put(`${projectMicroserviceUrl}/proposal/${id}`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

/**
 * product routes
 */
app.post('/api/product', (req, res) => {
  const body = req.body
  request.post(`${projectMicroserviceUrl}/product`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

app.get('/api/product', async (req, res) => {
  request.get(`${projectMicroserviceUrl}/product`, {}, (err, res_, body) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body)
  })
})

app.get('/api/product/:id', (req, res) => {
  const id = req.params.id
  request.get(`${projectMicroserviceUrl}/product/${id}`, {}, (err, res_, body) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body)
  })
})

app.put('/api/product/:id', (req, res) => {
  const id = req.params.id
  const body = req.body
  request.put(`${projectMicroserviceUrl}/product/${id}`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})


/**
 * client routes
 */
app.get('/api/client', (req, res) => {
  request.get(`${userMicroserviceUrl}/client`, {}, (err, res_, body) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body)
  })
})

app.post('/api/client', (req, res) => {
  const body = req.body
  request.post(`${userMicroserviceUrl}/client`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

app.get('/api/client/:id', (req, res) => {
  const id = req.params.id
  request.get(`${userMicroserviceUrl}/client/${id}`, {}, (err, res_, body) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body)
  })
})

app.put('/api/client/:id', (req, res) => {
  const body = req.body
  const id = req.params.id
  request.put(`${userMicroserviceUrl}/client/${id}`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})


/**
 * supervisor routes
 */
app.get('/api/supervisor', (req, res) => {
  request.get(`${userMicroserviceUrl}/supervisor`, {}, (err, res_, body) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body)
  })
})

app.post('/api/supervisor', (req, res) => {
  const body = req.body
  request.post(`${userMicroserviceUrl}/supervisor`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

app.get('/api/supervisor/:id', (req, res) => {
  const id = req.params.id
  request.get(`${userMicroserviceUrl}/supervisor/${id}`, {}, (err, res_, body) => {
    if(err) res.status(400).send(err)
    res.status(200).json(jsonParse(body))
  })
})

app.delete('/api/supervisor/:id', (req, res) => {
  const id = req.params.id
  request.delete(`${userMicroserviceUrl}/supervisor/${id}`, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

/**
 * coordinator routes
 */
app.post('/api/coordinator', (req, res) => {
  const body = req.body
  request.post(`${userMicroserviceUrl}/coordinator`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

app.get('/api/coordinator', (req, res) => {
  request.get(`${userMicroserviceUrl}/coordinator`, {}, (err, res_, body) => {
    if(err) res.status(400).send(err)
    res.status(200).json(jsonParse(body))
  })
})

app.get('/api/coordinator/:id', (req, res) => {
  const id = req.params.id
  request.get(`${userMicroserviceUrl}/coordinator/${id}`, {}, (err, res_, body) => {
    if(err) res.status(400).send(err)
    res.status(200).json(jsonParse(body))
  })
})

app.put('/api/coordinator/:id', (req, res) => {
  const body = req.body
  const id = req.params.id
  request.put(`${userMicroserviceUrl}/coordinator/${id}`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

app.delete('/api/coordinator/:id', (req, res) => {
  const id = req.params.id
  request.delete(`${userMicroserviceUrl}/coordinator/${id}`, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})


/**
 * subject routes
 */
app.get('/api/subject', async (req, res) => {
  const subjects_ = await get<string>(`${userMicroserviceUrl}/subject`)
  if(!subjects_) return res.status(400).send("get subjects failed: user microservice returned undefined")
  const subjects = jsonParse(subjects_) as HasCoordinatorId[]
  const subjectDetails = await Promise.all(subjects.map(async subject => {
    const coordinatorId = subject.coordinatorId
    if(!coordinatorId) return subject
    const coordinatorString = await get<string>(`${userMicroserviceUrl}/coordinator/${subject.coordinatorId}`)
    if(!coordinatorString) return subjects
    const coordinator = jsonParse(coordinatorString)
    const subjectDetails_ = {
      ...subject,
      coordinator: coordinator
    }
    return subjectDetails_
  }))
  res.status(200).send(subjectDetails)
})

app.get('/api/subject/:id', (req, res) => {
  const id = req.params.id
  request.get(`${userMicroserviceUrl}/subject/${id}`, {}, (err, res_, body) => {
    if(err) res.status(400).send(err)
    res.status(200).json(jsonParse(body))
  })
})

app.post('/api/subject', (req, res) => {
  const body = req.body
  request.post(`${userMicroserviceUrl}/subject`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

app.put('/api/subject/:id', (req, res) => {
  const body = req.body
  const id = req.params.id
  request.put(`${userMicroserviceUrl}/subject/${id}`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

app.delete('/api/subject/:id', (req, res) => {
  const id = req.params.id
  request.delete(`${userMicroserviceUrl}/subject/${id}`, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

/**
 * message routes
 */
app.get('/api/message', (req, res) => {
  request.get(`${messageMicroserviceUrl}/message`, {}, (err, res_, body) => {
    if(err) res.status(400).send(err)
    res.status(200).json(jsonParse(body))
  })
})

app.get('/api/message/:id', (req, res) => {
  const id = req.params.id
  request.get(`${messageMicroserviceUrl}/message/${id}`, {}, (err, res_, body) => {
    if(err) res.status(400).send(err)
    res.status(200).json(jsonParse(body))
  })
})

/**
 * message routes
 */
app.get('/api/message/:id', (req, res) => {
  const id = req.params.id
  request.get(`${messageMicroserviceUrl}/message`, {}, (err, res_, body) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body)
  })
})

app.post('/api/message', (req, res) => {
  const body = req.body
  request.post(`${messageMicroserviceUrl}/message`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

/**
 * message template routes
 */
app.get('/api/template', (req, res) => {
  request.get(`${messageMicroserviceUrl}/template`, {}, (err, res_, body) => {
    if(err) res.status(400).send(err)
    res.status(200).json(jsonParse(body))
  })
})

app.put('/api/template/:id', (req, res) => {
  const id = req.params.id
  const body = req.body
  request.put(`${messageMicroserviceUrl}/template/${id}`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

app.post('/api/template/:id', (req, res) => {
  const id = req.params.id
  const body = req.body
  request.post(`${messageMicroserviceUrl}/template/${id}`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

/**
 * product routes
 */
app.post('/api/product', (req, res) => {
  const body = req.body
  request.post(`${projectMicroserviceUrl}/product`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

app.get('/api/product', async (req, res) => {
  request.get(`${projectMicroserviceUrl}/product`, {}, (err, res_, body) => {
    if(err) res.status(400).send(err)
    res.status(200).json(jsonParse(body))
  })
})

app.get('/api/product/:id', (req, res) => {
  const id = req.params.id
  request.get(`${projectMicroserviceUrl}/product/${id}`, {}, (err, res_, body) => {
    if(err) res.status(400).send(err)
    res.status(200).json(jsonParse(body))
  })
})

app.put('/api/product/:id', (req, res) => {
  const id = req.params.id
  const body = req.body
  request.put(`${projectMicroserviceUrl}/product/${id}`, { json:body }, (err, res_, body_) => {
    if(err) res.status(400).send(err)
    res.status(200).send(body_)
  })
})

/**
 * upload doc
 */
app.post('/api/upload',function(req, res) {
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' +file.originalname )
    }
  })
  
  const upload = multer({ storage: storage }).array('file')

  upload(req, res, function (err) {
   
      if (err) {
          return res.status(500).json(err)
      } 
      
      return res.status(200).send(req.file)
      // Everything went fine.
    })
    
});

/**
 * reset system data to initial state
 */
app.post('/api/reset', async (req, res) => {
  const project = await post(`${projectMicroserviceUrl}/thanosta`, {})
  if(!project) return res.status(400).send("project microservice reset failed")

  const user = await post(`${userMicroserviceUrl}/Thanosta`, {})
  if(!user) return res.status(400).send("user microservice reset failed")

  const message = await post(`${messageMicroserviceUrl}/thanosta`, {})
  if(!message) return res.status(400).send("message microservice reset failed")

  return res.status(200).send("reset successful")
})

/**
 * starts server
 */
app.listen(port, () => Log("express started"))

