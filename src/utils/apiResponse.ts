export interface IResponse {
  status: string,
  message: string,
  data?: {} | [] | string | unknown | null
}

export const apiResponse = (status: string, message: string, data?:{} | [] | string | unknown | null): IResponse => {
  const response = {
    status,
    message,
    data
  }
  
  return response;
};