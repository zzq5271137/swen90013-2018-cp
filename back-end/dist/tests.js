"use strict";
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
var assert_1 = __importDefault(require("assert"));
var request_1 = __importDefault(require("request"));
var main_1 = require("./main");
main_1.BypassLogging(true);
describe("login", function () {
    it("should return status 200 when credentials are correct", function () {
        //how to test this without showing anyones credentials?
        assert_1.default.ok(true);
    });
});
describe("login", function () {
    it("should return status 401 when credentials are incorrect", function () {
        main_1.BypassAuth(false);
        new Promise(function (resolve) {
            var incorrectCredentials = { username: 'username1', password: 'secret' };
            request_1.default.post(main_1.Url + "/api/login", { body: incorrectCredentials, json: true }, function (err, res, body) {
                resolve(res.statusCode);
            });
        })
            .then(function (statusCode) { return assert_1.default.equal(statusCode, 401); })
            .catch(function (err) { return assert_1.default.fail(err); });
    });
});
describe("project", function () {
    describe("get all", function () {
        it("should return status 200 and array of projects", function () {
            main_1.BypassAuth(true);
            new Promise(function (resolve) {
                request_1.default.get(main_1.Url + "/api/project", function (err, res, body) {
                    resolve(res);
                });
            })
                .then(function (res) { return assert_1.default.equal(res.statusCode, 200); })
                .catch(function (err) { return assert_1.default.fail(err); });
        });
    });
});
describe("project", function () {
    describe("get by id", function () {
        it("should return status 200 and project with matching id", function () {
            main_1.BypassAuth(true);
            new Promise(function (resolve) {
                request_1.default.get(main_1.Url + "/api/project/5cebd3f0945fc80011e1cb95", function (err, res, body) {
                    resolve(res);
                });
            })
                .then(function (res) { return assert_1.default.deepEqual({ code: res.statusCode, data: JSON.parse(res.body)._id }, { code: 200, data: "5cebd3f0945fc80011e1cb95" }); })
                .catch(function (err) { return assert_1.default.fail(err); });
        });
    });
});
describe("project", function () {
    describe("create", function () {
        it("should return status 200 when valid project", function () {
            main_1.BypassAuth(true);
            new Promise(function (resolve) {
                var project = {
                    "status": "new",
                    "deployed": false,
                    "activelyUsed": false,
                    "name": "name 0",
                    "studentTeamId": "1",
                    "supervisorId": "1",
                    "clientId": "1",
                    "isInternal": false
                };
                request_1.default.post(main_1.Url + "/api/project", { body: project, json: true }, function (err, res, body) {
                    resolve(res);
                });
            })
                .then(function (res) { return assert_1.default.equal(res.statusCode, 200); })
                .catch(function (err) { return assert_1.default.fail(err); });
        });
    });
});
describe("proposal", function () {
    describe("get all", function () {
        it("should return status 200 and array of proposals", function () {
            main_1.BypassAuth(true);
            new Promise(function (resolve) {
                request_1.default.get(main_1.Url + "/api/proposal", function (err, res, body) {
                    resolve(res);
                });
            })
                .then(function (res) { return assert_1.default.equal(res.statusCode, 200); })
                .catch(function (err) { return assert_1.default.fail(err); });
        });
    });
});
describe("proposal", function () {
    describe("get by id", function () {
        it("should return status 200 and proposal with matching id", function () {
            main_1.BypassAuth(true);
            new Promise(function (resolve) {
                request_1.default.get(main_1.Url + "/api/proposal/5cea7cfd1862580011995ff2", function (err, res, body) {
                    resolve(res);
                });
            })
                .then(function (res) { return assert_1.default.deepEqual({ code: res.statusCode, data: JSON.parse(res.body)._id }, { code: 200, data: "5cea7cfd1862580011995ff2" }); })
                .catch(function (err) { return assert_1.default.fail(err); });
        });
    });
});
describe("proposal", function () {
    describe("create", function () {
        it("should return status 200 when valid proposal", function () {
            main_1.BypassAuth(true);
            new Promise(function (resolve) {
                var proposal = {
                    "status": "new",
                    "note": [],
                    "_id": "5cea7cfd1862580011995ff2",
                    "name": "name 0",
                    "outlineOfProject": "project outline 1",
                    "endProductBenefits": "end product benefits 1",
                    "beneficiaries": "beneficiaries 1",
                    "originality": "originality 1",
                    "clientId": "1",
                    "subjectName": "subject name 1",
                    "organisationId": "0",
                    "date": "2019-05-26T11:48:13.107Z",
                };
                request_1.default.post(main_1.Url + "/api/proposal", { body: proposal, json: true }, function (err, res, body) {
                    resolve(res);
                });
            })
                .then(function (res) { return assert_1.default.equal(res.statusCode, 200); })
                .catch(function (err) { return assert_1.default.fail(err); });
        });
    });
});
describe("proposal", function () {
    describe("accept", function () { return __awaiter(_this, void 0, void 0, function () {
        var supervisorFirstName, supervisorLastName, acceptProposalBody, proposalId, acceptProposalUrl, proposal;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    supervisorFirstName = "patanamon";
                    supervisorLastName = "thongtanunam";
                    acceptProposalBody = { subjectId: "Math", acceptReason: "good proposal" };
                    proposalId = "5d4f7769e627a9001120c9f1";
                    acceptProposalUrl = "api/proposal/" + proposalId + "/accept";
                    return [4 /*yield*/, main_1.post(acceptProposalUrl, acceptProposalBody)];
                case 1:
                    proposal = _a.sent();
                    if (!proposal)
                        throw "accept proposal failed: post request failed";
                    it("proposal status set to approved", function () {
                    });
                    it("correct project created", function () {
                        it("correct supervisor assigned to project", function () {
                        });
                        it("correct client assigned to project", function () {
                        });
                        it("correct reference to proposal", function () {
                        });
                    });
                    return [2 /*return*/];
            }
        });
    }); });
});
describe("proposal", function () {
    describe("reject", function () {
        //POST api/proposal/{proposalId}/reject with body { rejectReason: }
        it("proposal status set to reject", function () {
        });
        it("proposal note (reject reason) exists", function () {
        });
    });
});
describe("proposal", function () {
    describe("submit", function () {
        //POST api/proposal/submit with body of type SubmitProposal
        it("organisation created", function () {
        });
        it("client created", function () {
        });
        it("proposal created", function () {
        });
    });
});
describe("client", function () {
    describe("get all", function () {
        it("should return status 200 and array of client", function () {
            main_1.BypassAuth(true);
            new Promise(function (resolve) {
                request_1.default.get(main_1.Url + "/api/client", function (err, res, body) {
                    resolve(res);
                });
            })
                .then(function (res) { return assert_1.default.equal(res.statusCode, 200); })
                .catch(function (err) { return assert_1.default.fail(err); });
        });
    });
});
//TODO use valid id
describe("client", function () {
    describe("get by id", function () {
        it("should return status 200 and client with matching id", function () {
            main_1.BypassAuth(true);
            new Promise(function (resolve) {
                request_1.default.get(main_1.Url + "/api/client/5cea7cfd1862580011995ff2", function (err, res, body) {
                    resolve(res);
                });
            })
                .then(function (res) { return assert_1.default.deepEqual({ code: res.statusCode, data: JSON.parse(res.body)._id }, { code: 200, data: "5cea7cfd1862580011995ff2" }); })
                .catch(function (err) { return assert_1.default.fail(err); });
        });
    });
});
describe("client", function () {
    describe("create", function () {
        it("should return status 200 when valid client", function () {
            main_1.BypassAuth(true);
            new Promise(function (resolve) {
                var client = {
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
                };
                request_1.default.post(main_1.Url + "/api/client", { body: client, json: true }, function (err, res, body) {
                    resolve(res);
                });
            })
                .then(function (res) { return assert_1.default.equal(res.statusCode, 200); })
                .catch(function (err) { return assert_1.default.fail(err); });
        });
    });
});
//TODO use valid id
describe("organisation", function () {
    describe("get by id", function () {
        it("should return status 200 and organisation with matching id", function () {
            main_1.BypassAuth(true);
            new Promise(function (resolve) {
                request_1.default.get(main_1.Url + "/api/organisation/5cea7cfd1862580011995ff2", function (err, res, body) {
                    resolve(res);
                });
            })
                .then(function (res) { return assert_1.default.deepEqual({ code: res.statusCode, data: JSON.parse(res.body)._id }, { code: 200, data: "5cea7cfd1862580011995ff2" }); })
                .catch(function (err) { return assert_1.default.fail(err); });
        });
    });
});
describe("message", function () {
    describe("create", function () {
        it("should return status 200 when valid message", function () {
            main_1.BypassAuth(true);
            new Promise(function (resolve) {
                var message = {
                    "from": "supervisor",
                    "to": "client",
                    "subject": "meeting time?",
                    "date": "29-08-2019",
                    "html": "<h1>what time would you like to meet?<h1>",
                    "cc": ""
                };
                request_1.default.post(main_1.Url + "/api/message", { body: message, json: true }, function (err, res, body) {
                    resolve(res);
                });
            })
                .then(function (res) { return assert_1.default.equal(res.statusCode, 200); })
                .catch(function (err) { return assert_1.default.fail(err); });
        });
    });
});
