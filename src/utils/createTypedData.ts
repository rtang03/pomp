import { elog } from '@utils/consoleLog';
import toast from 'react-hot-toast';

export const createTypedData = (url: string, payload: any) =>
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload)
  }).then(async (res) => {
    if (res.status !== 200) {
      elog('[createTypedData]', `fail to create typed data: ${res.status}`);
      console.log(await res.text());
      toast.error('Fail to create typed data');
      return;
    }
    return res.json();
  });
