export default class Snippet {
    constructor(
        readonly attributes: any
    ) {}

    get id (): string { return this.attributes.id; }
    get title (): string { return this.attributes.title; }
    get code (): string { return this.attributes.code; }
    get type (): string { return this.attributes.type; }
    get tags (): Array<object> { return this.attributes.tags; }
    get meta (): Array<any> { return this.attributes.meta; }
    get desc (): string { return this.attributes.description; }
    get language (): string { return this.attributes.language; }
}