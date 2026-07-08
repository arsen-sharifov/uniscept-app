export const ALREADY_REGISTERED_PATTERN = /registered|already/i;

export const HTTP_STATUS_BY_PG_CODE: Record<string, number> = {
  '42501': 403,
  '23505': 409,
  '22023': 400,
  P0002: 404,
};
