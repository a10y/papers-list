export interface Paper {
	id: string;
	title: string;
	authors: string[];
	abstract: string;
	publication: string;
	date: string;
	doi: string | null;
	url: string | null;
	itemType: string;
}

export interface PaperDetail extends Paper {
	notes: Note[];
	tags: string[];
}

export interface Note {
	id: string;
	content: string;
}

export interface ZoteroItem {
	key: string;
	version: number;
	library: {
		type: string;
		id: number;
		name: string;
	};
	data: ZoteroItemData;
}

export interface ZoteroItemData {
	key: string;
	version: number;
	itemType: string;
	title?: string;
	creators?: ZoteroCreator[];
	abstractNote?: string;
	publicationTitle?: string;
	journalAbbreviation?: string;
	date?: string;
	DOI?: string;
	url?: string;
	tags?: { tag: string }[];
	// Note-specific fields
	note?: string;
	parentItem?: string;
}

export interface ZoteroCreator {
	creatorType: string;
	firstName?: string;
	lastName?: string;
	name?: string;
}

export interface CachedData<T> {
	data: T;
	timestamp: number;
}
