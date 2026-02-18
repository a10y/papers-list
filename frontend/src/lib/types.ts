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
