"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var passport_ldapauth_1 = __importDefault(require("passport-ldapauth"));
var passport_1 = __importDefault(require("passport"));
var cookie_session_1 = __importDefault(require("cookie-session"));
var request_1 = __importDefault(require("request"));
/**
 * testing utility functions
 */
var bypassAuth = false;
exports.BypassAuth = function (value) { return bypassAuth = value; };
var bypassLogging = false;
exports.BypassLogging = function (value) { return bypassLogging = value; };
exports.Log = function (message) {
    if (bypassLogging)
        return;
    console.log(message);
};
/**
 * user is serialised for use in cookie session token
 */
passport_1.default.serializeUser(function (user, done) {
    done(null, user.uid);
});
passport_1.default.deserializeUser(function (id, done) {
    done(null, id);
});
var ldapOptions = {
    server: {
        url: 'ldaps://centaur.unimelb.edu.au/',
        searchBase: 'ou=people, o=unimelb',
        searchFilter: '(uid={{username}})'
    }
};
passport_1.default.use(new passport_ldapauth_1.default(ldapOptions));
var app = express_1.default();
/**
 * express web server middleware - auth, cors, json request body parsing
 */
var cors = require('cors');
app.use(cors({ credentials: true, origin: true }));
app.use(cookie_session_1.default({
    maxAge: 24 * 60 * 60 * 1000,
    keys: ['randomkey']
}));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
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
 * config - microservice url's
 */
var userMicroserviceUrl = "http://35.244.89.250";
var projectMicroserviceUrl = "http://35.247.162.193";
var messageMicroserviceUrl = "localhost";
var port = 13000;
exports.Url = "http://localhost:" + port;
/**
 * http helper functions to reduce boilerplate code
 */
exports.put = function (url, body) {
    return new Promise(function (resolve, _) {
        request_1.default.put(url, { json: body }, function (err, res_, body_) {
            if (err)
                return resolve(undefined);
            return resolve(body_);
        });
    });
};
exports.post = function (url, body) {
    return new Promise(function (resolve, _) {
        request_1.default.post(url, { json: body }, function (err, res_, body_) {
            if (err)
                return resolve(undefined);
            return resolve(body_);
        });
    });
};
exports.get = function (url) {
    return new Promise(function (resolve, _) {
        request_1.default.get(url, function (err, res_, body_) {
            if (err)
                return resolve(undefined);
            return resolve(body_);
        });
    });
};
/**
 * auth routes
 */
app.post('/api/login', passport_1.default.authenticate('ldapauth'), function (req, res) {
    res.status(200).send("success");
});
/**
 * project routes
 */
app.get('/api/project', function (req, res) {
    request_1.default.get(projectMicroserviceUrl + "/project", {}, function (err, res_, body) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body);
    });
});
app.post('/api/project', function (req, res) {
    var body = req.body;
    request_1.default.post(projectMicroserviceUrl + "/project", { json: body }, function (err, res_, body_) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body_);
    });
});
app.get('/api/project/:id', function (req, res) {
    var id = req.params.id;
    request_1.default.get(projectMicroserviceUrl + "/project/" + id, {}, function (err, res_, body) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body);
    });
});
/**
 * proposal routes
 */
app.get('/api/proposal', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var proposals_, proposals, proposalDetails;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.get(projectMicroserviceUrl + "/proposal")];
            case 1:
                proposals_ = _a.sent();
                if (!proposals_)
                    return [2 /*return*/, res.status(400).send("get proposals failed: project microservice returned undefined")];
                proposals = JSON.parse(proposals_);
                return [4 /*yield*/, Promise.all(proposals.map(function (proposal) { return __awaiter(_this, void 0, void 0, function () {
                        var clientId, clientString, client, proposalDetails_;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    clientId = proposal.clientId;
                                    if (!clientId)
                                        return [2 /*return*/, proposal];
                                    return [4 /*yield*/, exports.get(userMicroserviceUrl + "/client/" + proposal.clientId)];
                                case 1:
                                    clientString = _a.sent();
                                    if (!clientString)
                                        return [2 /*return*/, proposal];
                                    client = JSON.parse(clientString);
                                    proposalDetails_ = __assign({}, proposal, { client: client });
                                    return [2 /*return*/, proposalDetails_];
                            }
                        });
                    }); }))];
            case 2:
                proposalDetails = _a.sent();
                res.status(200).send(proposalDetails);
                return [2 /*return*/];
        }
    });
}); });
app.post('/api/proposal', function (req, res) {
    var body = req.body;
    request_1.default.post(projectMicroserviceUrl + "/proposal", { json: body }, function (err, res_, body_) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body_);
    });
});
app.post('/api/proposal/:id/note', function (req, res) {
    var body = req.body;
    var id = req.params.id;
    request_1.default.post(projectMicroserviceUrl + "/proposal/" + id + "/note", { json: body }, function (err, res_, body_) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body_);
    });
});
app.post('/api/proposal/:id/accept', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var body, proposalId, proposalString, proposal, proposal_, updateProposal, project, newProject;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = req.body;
                if (!body)
                    return [2 /*return*/, res.status(400).send("accept proposal failed: body of request does not contain correct info")];
                proposalId = req.params.id;
                return [4 /*yield*/, exports.get(projectMicroserviceUrl + "/proposal/" + proposalId)];
            case 1:
                proposalString = _a.sent();
                if (!proposalString)
                    return [2 /*return*/, res.status(400).send("accept proposal failed: could not find proposal with id " + proposalId)];
                proposal = JSON.parse(proposalString);
                proposal_ = __assign({}, proposal, { status: "approved", notes: (proposal.notes ? proposal.notes : []).concat([({ text: body.acceptReason, date: "" + Date.now() })]) });
                return [4 /*yield*/, exports.put(projectMicroserviceUrl + "/proposal/" + proposalId, proposal_)];
            case 2:
                updateProposal = _a.sent();
                if (!updateProposal)
                    return [2 /*return*/, res.status(400).send("accept proposal failed: could not update proposal with id " + proposalId + ". setting status to approved, appending note and assigning subject")
                        //create project from proposal
                    ];
                project = {
                    name: proposal.name,
                    status: "new",
                    isInternal: false,
                    proposalId: proposalId,
                };
                return [4 /*yield*/, exports.post(projectMicroserviceUrl + "/project", project)];
            case 3:
                newProject = _a.sent();
                if (!newProject)
                    return [2 /*return*/, res.status(400).send("accept proposal failed: could not create project from proposal")];
                return [2 /*return*/, res.status(200).json({
                        projectId: newProject._id,
                        proposal: proposal_
                    })];
        }
    });
}); });
app.post('/api/proposal/:id/reject', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var body, proposalId, proposalString, proposal, proposal_, updateProposal;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = req.body;
                if (!body)
                    return [2 /*return*/, res.status(400).send("reject proposal failed: body of request does not contain correct info")];
                proposalId = req.params.id;
                return [4 /*yield*/, exports.get(projectMicroserviceUrl + "/proposal/" + proposalId)];
            case 1:
                proposalString = _a.sent();
                if (!proposalString)
                    return [2 /*return*/, res.status(400).send("reject proposal failed: could not find proposal with id " + proposalId)];
                proposal = JSON.parse(proposalString);
                proposal_ = __assign({}, proposal, { status: "reject", notes: (proposal.notes ? proposal.notes : []).concat([{ date: "", text: body.rejectReason }]) });
                return [4 /*yield*/, exports.put(projectMicroserviceUrl + "/proposal/" + proposalId, proposal_)];
            case 2:
                updateProposal = _a.sent();
                if (!updateProposal)
                    return [2 /*return*/, res.status(400).send("reject proposal failed: could not update status of proposal with id " + proposalId + " to reject")];
                return [2 /*return*/, res.status(200).json({
                        proposal: proposal_
                    })];
        }
    });
}); });
app.post('/api/proposal/submit', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var body, client, newClient, proposal, newProposal;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = req.body;
                client = {
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
                        name: body.organisationName,
                        description: body.organisationBrief,
                        size: body.size,
                        number: parseFloat(body.officeNumber)
                    }
                };
                return [4 /*yield*/, exports.post(userMicroserviceUrl + "/client", client)];
            case 1:
                newClient = _a.sent();
                if (!newClient)
                    return [2 /*return*/, res.status(400).send("submit proposal failed: could not create client")
                        //create proposal record
                    ];
                proposal = {
                    name: body.projectName,
                    status: "new",
                    outlineOfProject: body.outline,
                    endProductBenefits: body.benefits,
                    endProductUse: body.used,
                    beneficiaries: body.beneficiaries,
                    originality: body.original,
                    clientId: newClient._id,
                    notes: []
                };
                return [4 /*yield*/, exports.post(projectMicroserviceUrl + "/proposal", proposal)];
            case 2:
                newProposal = _a.sent();
                if (!newProposal)
                    return [2 /*return*/, res.status(400).send("submit proposal failed: could not create proposal")];
                res.status(200).json({
                    clientId: newClient._id,
                    proposalId: newProposal._id
                });
                return [2 /*return*/];
        }
    });
}); });
app.get('/api/proposal/:id', function (req, res) {
    var id = req.params.id;
    request_1.default.get(projectMicroserviceUrl + "/proposal/" + id, {}, function (err, res_, body) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body);
    });
});
app.put('/api/proposal/:id', function (req, res) {
    var id = req.params.id;
    var body = req.body;
    request_1.default.put(projectMicroserviceUrl + "/proposal/" + id, { json: body }, function (err, res_, body_) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body_);
    });
});
/**
 * product routes
 */
app.post('/api/product', function (req, res) {
    var body = req.body;
    request_1.default.post(projectMicroserviceUrl + "/product", { json: body }, function (err, res_, body_) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body_);
    });
});
app.get('/api/product', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        request_1.default.get(projectMicroserviceUrl + "/product", {}, function (err, res_, body) {
            if (err)
                res.status(400).send(err);
            res.status(200).send(body);
        });
        return [2 /*return*/];
    });
}); });
app.get('/api/product/:id', function (req, res) {
    var id = req.params.id;
    request_1.default.get(projectMicroserviceUrl + "/product/" + id, {}, function (err, res_, body) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body);
    });
});
app.put('/api/product/:id', function (req, res) {
    var id = req.params.id;
    var body = req.body;
    request_1.default.put(projectMicroserviceUrl + "/product/" + id, { json: body }, function (err, res_, body_) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body_);
    });
});
/**
 * client routes
 */
app.get('/api/client', function (req, res) {
    request_1.default.get(userMicroserviceUrl + "/client", {}, function (err, res_, body) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body);
    });
});
app.post('/api/client', function (req, res) {
    var body = req.body;
    request_1.default.post(userMicroserviceUrl + "/client", { json: body }, function (err, res_, body_) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body_);
    });
});
app.get('/api/client/:id', function (req, res) {
    var id = req.params.id;
    request_1.default.get(userMicroserviceUrl + "/client/" + id, {}, function (err, res_, body) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body);
    });
});
app.put('/api/client', function (req, res) {
    var body = req.body;
    request_1.default.post(userMicroserviceUrl + "/client", { json: body }, function (err, res_, body_) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body_);
    });
});
/**
 * organisation routes
 */
app.get('/api/organization/:id', function (req, res) {
    var id = req.params.id;
    request_1.default.get(userMicroserviceUrl + "/organization/" + id, {}, function (err, res_, body) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body);
    });
});
/**
 * message routes
 */
app.get('/api/message/:id', function (req, res) {
    var id = req.params.id;
    request_1.default.get(messageMicroserviceUrl + "/message", {}, function (err, res_, body) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body);
    });
});
app.post('/api/message', function (req, res) {
    var body = req.body;
    request_1.default.post(messageMicroserviceUrl + "/message", { json: body }, function (err, res_, body_) {
        if (err)
            res.status(400).send(err);
        res.status(200).send(body_);
    });
});
/**
 * starts server
 */
app.listen(port, function () { return exports.Log("express started"); });
