import pkg from '../labeler-core/dist/labeler-core.module.js';
const { AdBlockParser, AdBlockEvaluator } = pkg.Labeler;

export default [{
  name: "EasyList",
  url: "https://easylist.to/easylist/easylist.txt",
  evaluator: AdBlockEvaluator(AdBlockParser)
}, {
  name: "EasyPrivacy",
  url: "https://easylist.to/easylist/easyprivacy.txt",
  evaluator: AdBlockEvaluator(AdBlockParser)
}/*, {
  name: "Disconnect.me",
  url: "https://raw.githubusercontent.com/disconnectme/disconnect-tracking-protection/master/services.json",
  evaluator: DisconnectMeEvaluator(DisconnectMeParser)
}*/];