export const toResponseError = async (res: Response, fallbackMessage: string) => {
  const body = await res.json().catch(() => null);

  return Object.assign(new Error(body?.error?.message ?? fallbackMessage), {
    status: res.status,
    code: body?.error?.code,
  });
};
