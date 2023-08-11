"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
exports.__esModule = true;
exports.uploader = exports.parseLocation = exports.readProperties = exports.reporter = void 0;
var typescript_1 = require("typescript");
var command_1 = require("@actions/core/lib/command");
var github_1 = require("@actions/github");
var core_1 = require("@actions/core");
exports.reporter = function (ts) { return function (diagnostic) {
    switch (diagnostic.category) {
        case ts.DiagnosticCategory.Error: {
            return command_1.issueCommand('error', exports.readProperties(diagnostic), ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
        }
        case ts.DiagnosticCategory.Warning: {
            return command_1.issueCommand('warning', exports.readProperties(diagnostic), ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
        }
    }
}; };
exports.readProperties = function (_a) {
    var start = _a.start, file = _a.file;
    var fileName = file && file.fileName;
    if (!fileName)
        return {};
    if (!start)
        return { file: fileName };
    var content = file.getFullText();
    var _b = exports.parseLocation(content, start), line = _b.line, column = _b.column;
    return { file: fileName, line: "" + line, col: "" + column };
};
exports.parseLocation = function (content, position) {
    var l = 1;
    var c = 0;
    for (var i = 0; i < content.length && i < position; i++) {
        var cc = content[i];
        if (cc === '\n') {
            c = 0;
            l++;
        }
        else {
            c++;
        }
    }
    return { line: l, column: c };
};
// conbined code from 
// https://github.com/tangro/actions-test/blob/3aa079b6cbd9e6f26a6e4516e6ca5b73c3f6f7ac/src/test/checkRun.ts#L76-L93
// https://github.com/Attest/annotations-action/blob/0b9e2f246879c10ddf456fea5195a7ada1a9aa2b/src/github.ts#L65-L89
exports.uploader = function (ts) { return function (diagnostics) { return __awaiter(void 0, void 0, void 0, function () {
    var repoToken, octokit, pullRequest, ref, _a, owner, repo_1, checkRunId, batchedAnnotations, _i, batchedAnnotations_1, batch_1, annotations, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                repoToken = core_1.getInput('repo_token', { required: false });
                if (!repoToken) return [3 /*break*/, 2];
                octokit = github_1.getOctokit(repoToken);
                pullRequest = github_1.context.payload.pull_request;
                ref = void 0;
                if (pullRequest) {
                    ref = pullRequest.head.sha;
                }
                else {
                    ref = github_1.context.sha;
                }
                _a = github_1.context.repo, owner = _a.owner, repo_1 = _a.repo;
                return [4 /*yield*/, octokit.checks.create({
                        owner: owner,
                        repo: repo_1,
                        name: "Update TypeScript error annotations",
                        head_sha: ref,
                        status: 'in_progress'
                    })
                    // The GitHub API requires that annotations are submitted in batches of 50 elements maximum
                ];
            case 1:
                checkRunId = (_b.sent()).data.id;
                batchedAnnotations = batch(50, diagnostics);
                for (_i = 0, batchedAnnotations_1 = batchedAnnotations; _i < batchedAnnotations_1.length; _i++) {
                    batch_1 = batchedAnnotations_1[_i];
                    annotations = batch_1.map(function (diagnostic) {
                        var _a = exports.readProperties(diagnostic), line = _a.line, _b = _a.file, file = _b === void 0 ? "" : _b;
                        return {
                            path: file.replace(process.env.RUNNER_WORKSPACE + "/" + repo_1 + "/", ''),
                            start_line: Number(line || 1),
                            end_line: Number(line || 1),
                            annotation_level: getAnnotationLevel(diagnostic),
                            message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
                        };
                    });
                    octokit.checks.update({
                        owner: owner,
                        repo: repo_1,
                        check_run_id: checkRunId,
                        status: 'completed',
                        conclusion: 'success',
                        output: {
                            title: "TypeScript errors",
                            summary: "Found " + diagnostics.length + " TypeScript errors",
                            annotations: annotations
                        }
                    })["catch"](function (err) {
                        console.log("upload fetch err", err);
                    });
                }
                _b.label = 2;
            case 2: return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                console.log("error uploading annotations", error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); }; };
function batch(size, inputs) {
    return inputs.reduce(function (batches, input) {
        var current = batches[batches.length - 1];
        current.push(input);
        if (current.length === size) {
            batches.push([]);
        }
        return batches;
    }, [[]]);
}
var getAnnotationLevel = function (diagnostic) {
    switch (diagnostic.category) {
        case typescript_1.DiagnosticCategory.Error:
            return "failure";
        case typescript_1.DiagnosticCategory.Warning:
            return "warning";
        default:
            return "notice";
    }
};
