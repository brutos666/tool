import { callRequestApi } from './callApi';

function getTodayTask() {
  return callRequestApi('/task', {});
}

export default { getTodayTask };
