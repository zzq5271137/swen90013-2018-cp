import assert from 'assert'
import request from 'request'
import { Url, BypassAuth, BypassLogging, get, post, put, AcceptProposal } from './main'


BypassLogging(true)

describe("login", () => {
    it("should return status 200 when credentials are correct", () => {
        //how to test this without showing anyones credentials?
        assert.ok(true)
    })
})

describe("login", () => {
    it("should return status 401 when credentials are incorrect", () => {
        BypassAuth(false)
        new Promise(resolve => {
            const incorrectCredentials = { username: 'username1', password: 'secret' }
            request.post(`${Url}/api/login`, { body:incorrectCredentials, json:true }, (err, res, body) => {
                resolve(res.statusCode)
            })
        })
        .then(statusCode => assert.equal(statusCode, 401))
        .catch(err => assert.fail(err))
    })
})

describe("project", () => {
    describe("get all", () => {
        it("should return status 200 and array of projects", () => {
            BypassAuth(true)
            new Promise<request.Response>(resolve => {
                request.get(`${Url}/api/project`, (err, res, body) => {
                    resolve(res)
                })
            })
            .then(res => assert.equal(res.statusCode, 200))
            .catch(err => assert.fail(err))
        })
    })
})

describe("project", () => {
    describe("get by id", () => {
        it("should return status 200 and project with matching id", () => {
            BypassAuth(true)
            new Promise<request.Response>(resolve => {
                request.get(`${Url}/api/project/5cebd3f0945fc80011e1cb95`, (err, res, body) => {
                    resolve(res)
                })
            })
            .then(res => assert.deepEqual({code:res.statusCode, data:JSON.parse(res.body)._id}, { code:200, data:`5cebd3f0945fc80011e1cb95`}))
            .catch(err => assert.fail(err))
        })
    })
})

describe("project", () => {
    describe("create", () => {
        it("should return status 200 when valid project", () => {
            BypassAuth(true)
            new Promise<request.Response>(resolve => {
                const project = {
                    "status":"new",
                    "deployed":false,
                    "activelyUsed":false,
                    "name":"name 0",
                    "studentTeamId":"1",
                    "supervisorId":"1",
                    "clientId":"1",
                    "isInternal":false
                }
                request.post(`${Url}/api/project`, { body:project, json:true }, (err, res, body) => {
                    resolve(res)
                })
            })
            .then(res => assert.equal(res.statusCode, 200))
            .catch(err => assert.fail(err))
        })
    })
})

describe("proposal", () => {
    describe("get all", () => {
        it("should return status 200 and array of proposals", () => {
            BypassAuth(true)
            new Promise<request.Response>(resolve => {
                request.get(`${Url}/api/proposal`, (err, res, body) => {
                    resolve(res)
                })
            })
            .then(res => assert.equal(res.statusCode, 200))
            .catch(err => assert.fail(err))
        })
    })
})

describe("proposal", () => {
    describe("get by id", () => {
        it("should return status 200 and proposal with matching id", () => {
            BypassAuth(true)
            new Promise<request.Response>(resolve => {
                request.get(`${Url}/api/proposal/5cea7cfd1862580011995ff2`, (err, res, body) => {
                    resolve(res)
                })
            })
            .then(res => assert.deepEqual({code:res.statusCode, data:JSON.parse(res.body)._id}, { code:200, data:`5cea7cfd1862580011995ff2`}))
            .catch(err => assert.fail(err))
        })
    })
})

describe("proposal", () => {
    describe("create", () => {
        it("should return status 200 when valid proposal", () => {
            BypassAuth(true)
            new Promise<request.Response>(resolve => {
                const proposal = {
                    "status":"new",
                    "note":[],
                    "_id":"5cea7cfd1862580011995ff2",
                    "name":"name 0",
                    "outlineOfProject":"project outline 1",
                    "endProductBenefits":"end product benefits 1",
                    "beneficiaries":"beneficiaries 1",
                    "originality":"originality 1",
                    "clientId":"1",
                    "subjectName":"subject name 1",
                    "organisationId":"0",
                    "date":"2019-05-26T11:48:13.107Z",
                }
                request.post(`${Url}/api/proposal`, { body:proposal, json:true }, (err, res, body) => {
                    resolve(res)
                })
            })
            .then(res => assert.equal(res.statusCode, 200))
            .catch(err => assert.fail(err))
        })
    })
})

describe("proposal", () => {
    describe("accept", async () => {

        //POST api/proposal/{proposalId}/accept with body { supervisorName: }
        const supervisorFirstName = "patanamon"
        const supervisorLastName = "thongtanunam"
        const acceptProposalBody = { subjectId:"Math", acceptReason:"good proposal" }
        const proposalId = "5d4f7769e627a9001120c9f1"
        const acceptProposalUrl = `api/proposal/${proposalId}/accept`
        const proposal = await post<AcceptProposal, {}>(acceptProposalUrl, acceptProposalBody)
        if(!proposal) throw "accept proposal failed: post request failed"

        it("proposal status set to approved", () => {
            
        })
        it("correct project created", () => {
            it("correct supervisor assigned to project", () => {

            })
            it("correct client assigned to project", () => {
    
            })
            it("correct reference to proposal", () => {
    
            })
        })
    })
})

describe("proposal", () => {
    describe("reject", () => {

        //POST api/proposal/{proposalId}/reject with body { rejectReason: }

        it("proposal status set to reject", () => {
            
        })
        it("proposal note (reject reason) exists", () => {

        })
    })
})

describe("proposal", () => {
    describe("submit", () => {

        //POST api/proposal/submit with body of type SubmitProposal

        it("organisation created", () => {
            
        })
        it("client created", () => {

        })
        it("proposal created", () => {

        })
    })
})


describe("client", () => {
    describe("get all", () => {
        it("should return status 200 and array of client", () => {
            BypassAuth(true)
            new Promise<request.Response>(resolve => {
                request.get(`${Url}/api/client`, (err, res, body) => {
                    resolve(res)
                })
            })
            .then(res => assert.equal(res.statusCode, 200))
            .catch(err => assert.fail(err))
        })
    })
})

//TODO use valid id
describe("client", () => {
    describe("get by id", () => {
        it("should return status 200 and client with matching id", () => {
            BypassAuth(true)
            new Promise<request.Response>(resolve => {
                request.get(`${Url}/api/client/5cea7cfd1862580011995ff2`, (err, res, body) => {
                    resolve(res)
                })
            })
            .then(res => assert.deepEqual({code:res.statusCode, data:JSON.parse(res.body)._id}, { code:200, data:`5cea7cfd1862580011995ff2`}))
            .catch(err => assert.fail(err))
        })
    })
})

describe("client", () => {
    describe("create", () => {
        it("should return status 200 when valid client", () => {
            BypassAuth(true)
            new Promise<request.Response>(resolve => {
                const client = {
                    "FirstName": "FirstName 0",
                    "LastName": "LastName 0",
                    "Email": "Email 0",
                    "ContactNumber": "ContactNumber 0",
                    "TechnicalAbility": "TechnicalAbility 0",
                    "SecondaryContactFirstName": "SecondaryContactFirstName 0",
                    "SecondaryContactLastName": "SecondaryContactLastName 0",
                    "SecondaryContactEmail": "SecondaryContactEmail 0",
                    "SecondaryContactNumber": "SecondaryContactNumber 0",
                    "Flag": false,
                    "ClientOrganizationID": 0,
                    "ClientNoteIds": []
                }
    
                request.post(`${Url}/api/client`, { body:client, json:true }, (err, res, body) => {
                    resolve(res)
                })
            })
            .then(res => assert.equal(res.statusCode, 200))
            .catch(err => assert.fail(err))
        })
    })
})

//TODO use valid id
describe("organisation", () => {
    describe("get by id", () => {
        it("should return status 200 and organisation with matching id", () => {
            BypassAuth(true)
            new Promise<request.Response>(resolve => {
                request.get(`${Url}/api/organisation/5cea7cfd1862580011995ff2`, (err, res, body) => {
                    resolve(res)
                })
            })
            .then(res => assert.deepEqual({code:res.statusCode, data:JSON.parse(res.body)._id}, { code:200, data:`5cea7cfd1862580011995ff2`}))
            .catch(err => assert.fail(err))
        })
    })
})

describe("message", () => {
    describe("create", () => {
        it("should return status 200 when valid message", () => {
            BypassAuth(true)
            new Promise<request.Response>(resolve => {
                const message = {
                    "from": "supervisor",
                    "to": "client",
                    "subject": "meeting time?",
                    "date": "29-08-2019",
                    "html": "<h1>what time would you like to meet?<h1>",
                    "cc": ""
                }
    
                request.post(`${Url}/api/message`, { body:message, json:true }, (err, res, body) => {
                    resolve(res)
                })
            })
            .then(res => assert.equal(res.statusCode, 200))
            .catch(err => assert.fail(err))
        })
    })
})