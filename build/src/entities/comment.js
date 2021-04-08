"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const typeorm_1 = require("typeorm");
const story_1 = require("./story");
let Comment = class Comment {
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", Number)
], Comment.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({
        type: "bigint",
        nullable: true
    }),
    __metadata("design:type", Object)
], Comment.prototype, "time", void 0);
__decorate([
    typeorm_1.Column({
        type: 'varchar',
        nullable: true
    }),
    __metadata("design:type", Object)
], Comment.prototype, "text", void 0);
__decorate([
    typeorm_1.Column({
        type: 'varchar',
        nullable: true
    }),
    __metadata("design:type", Object)
], Comment.prototype, "author", void 0);
__decorate([
    typeorm_1.ManyToOne(() => story_1.Story, story => story.comments),
    __metadata("design:type", story_1.Story)
], Comment.prototype, "story", void 0);
Comment = __decorate([
    typeorm_1.Entity()
], Comment);
exports.Comment = Comment;
//# sourceMappingURL=comment.js.map