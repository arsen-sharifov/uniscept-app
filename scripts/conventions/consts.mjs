export const ISSUE_BRANCH = /^dev-(\d+)$/;
export const ISSUE_SCOPE = /^\w+\(dev-(\d+)\)!?: /;
export const UNSCOPED_SUBJECT = /^(?:[Rr]evert |[Rr]eapply |(?:amend|fixup|squash)!)/;
export const NON_CLOSING_MARKDOWN = /<!--[\s\S]*?-->|```[\s\S]*?```|~~~[\s\S]*?~~~/g;
export const CLOSING_ISSUE = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?):?\s+#(\d+)\b/gi;
export const RELEASE_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export const HIDDEN_CHARACTER = /\p{Default_Ignorable_Code_Point}/u;
