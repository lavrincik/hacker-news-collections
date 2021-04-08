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
exports.Story = void 0;
const typeorm_1 = require("typeorm");
const collection_1 = require("./collection");
const comment_1 = require("./comment");
let Story = class Story {
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", Number)
], Story.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({
        type: "bigint",
        nullable: true
    }),
    __metadata("design:type", Number)
], Story.prototype, "time", void 0);
__decorate([
    typeorm_1.Column({
        type: 'varchar',
        nullable: true
    }),
    __metadata("design:type", Object)
], Story.prototype, "title", void 0);
__decorate([
    typeorm_1.Column({
        type: 'varchar',
        nullable: true
    }),
    __metadata("design:type", Object)
], Story.prototype, "author", void 0);
__decorate([
    typeorm_1.ManyToMany(() => collection_1.Collection, collection => collection.stories),
    __metadata("design:type", Array)
], Story.prototype, "collections", void 0);
__decorate([
    typeorm_1.OneToMany(() => comment_1.Comment, comment => comment.story),
    __metadata("design:type", Array)
], Story.prototype, "comments", void 0);
Story = __decorate([
    typeorm_1.Entity()
], Story);
exports.Story = Story;
//# sourceMappingURL=story.js.map