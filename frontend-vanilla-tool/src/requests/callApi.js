import { URL_ROOT } from '../tools/constants';

async function callRequestApi(api, data) {
  var response, responseData;
  try {
    response = await fetch(URL_ROOT + api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    responseData = await response.json();
    console.log(responseData);
  } catch (error) {
    console.error('Erreur :', error);
  }
  return responseData;
}

export { callRequestApi };
