export default class Snippet {
    constructor(
        readonly attributes: any
    ) {}

    get id (): number { return this.attributes.id; }
    get title (): string { return this.attributes.title; }
    get code (): string { return this.attributes.code; }
    get type (): string { return this.attributes.type; }
    get tags (): any[] { return this.attributes.tags; }
    get meta (): any[] { return this.attributes.meta; }
    get desc (): string { return this.attributes.description; }
    get isOwner (): string { return this.attributes.is_owner; }
    get language (): string { return this.attributes.language; }
}