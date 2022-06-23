export const getUser = async () => {
  const path = '/api/users';

  const response = await fetch(path);
  const {data} = await response.json();

  return data;
}