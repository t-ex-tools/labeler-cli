import BlockList from './labeler-core/BlockList.js';
import EasyListParser from './labeler-core/EasyListParser.js';
import EasyListEvaluator from './labeler-core/EasyListEvaluator.js';
import DisconnectMeParser from './labeler-core/DisconnectMeParser.js';
import DisconnectMeEvaluator from './labeler-core/DisconnectMeEvaluator.js';

import fetch from 'node-fetch';

export default [{
  name: "EasyList",
  url: "https://easylist.to/easylist/easylist.txt",
  evaluator: EasyListEvaluator(EasyListParser)
}, {
  name: "EasyPrivacy",
  url: "https://easylist.to/easylist/easyprivacy.txt",
  evaluator: EasyListEvaluator(EasyListParser)
}, {
  name: "Disconnect.me",
  url: "https://raw.githubusercontent.com/disconnectme/disconnect-tracking-protection/master/services.json",
  evaluator: DisconnectMeEvaluator(DisconnectMeParser)
}].map((e) =>
  fetch(e.url)
    .then((response) => response.text())
    .then((rawList) => new BlockList(e.name, rawList, e.evaluator))
);