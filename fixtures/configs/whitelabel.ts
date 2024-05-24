export const isWhitelabel = (domain: string = process.env.BASE_URL) => {
  return !domain.match(
    /(http|https):\/\/((local\.|testing\.)?datadesk.io|localhost)/i,
  );
};
