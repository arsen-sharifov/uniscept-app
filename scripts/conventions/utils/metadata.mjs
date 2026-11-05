import {
  CLOSING_ISSUE,
  ISSUE_BRANCH,
  ISSUE_SCOPE,
  NON_CLOSING_MARKDOWN,
  RELEASE_VERSION,
  UNSCOPED_SUBJECT,
} from '../consts.mjs';

const readVersionParts = (version) => RELEASE_VERSION.exec(version)?.slice(1).map(Number);

const isAbove = (version, baseVersion) => {
  const parts = readVersionParts(version);
  const baseParts = readVersionParts(baseVersion);

  if (!parts || !baseParts) return false;

  const index = parts.findIndex((part, position) => part !== baseParts[position]);

  return index !== -1 && parts[index] > baseParts[index];
};

export const getPullRequestErrors = ({ branch, title, body, subjects, version, baseVersion }) => {
  const issue = ISSUE_BRANCH.exec(branch)?.[1];

  if (!issue) return ['The branch must be named dev-<issue number>'];

  const closingIssues = [
    ...new Set([...body.replace(NON_CLOSING_MARKDOWN, '').matchAll(CLOSING_ISSUE)].map(([, number]) => number)),
  ];

  return [
    ISSUE_SCOPE.exec(title)?.[1] !== issue && `The title scope must be dev-${issue} to match the branch`,
    closingIssues.join() !== issue && `The description must close only #${issue}`,
    subjects.some((subject) => !UNSCOPED_SUBJECT.test(subject) && ISSUE_SCOPE.exec(subject)?.[1] !== issue) &&
      `Every commit scope must be dev-${issue}`,
    !isAbove(version, baseVersion) && `The version must be above ${baseVersion}, found ${version}`,
  ].filter(Boolean);
};
