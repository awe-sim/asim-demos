import { uniq } from 'lodash';
import { ALL_ACTIONS, Action } from './action';
import { Edge } from './edge';
import { State } from './state';
import { Release } from './release';
import { Process } from './process';

export class Workflow {
  constructor(public readonly edges: ReadonlyArray<Edge>) {}
  getActions(processes: Process[]): Action[] {
    const states = uniq(processes.map(p => p.state));
    const connections = uniq(processes.map(p => p.connection));
    const directions = uniq(processes.map(p => p.direction));
    const origins = uniq(processes.map(p => p.origin));
    const edges = this.edges.filter(e => states.includes(e.state) && e.action.checkConnections(connections) && e.action.checkDirections(directions) && e.action.checkOrigins(origins));
    const sortedEdges = [...edges].sort((a, b) => a.action.rank - b.action.rank);
    const actions = sortedEdges.map(e => e.action);
    const replacedActions = uniq(actions.map(a => a.parent ?? a));
    return replacedActions;
  }
  executeAction(action: Action, release: Release, processes: Process[]): { release: Release; emailLogs: string[] } {
    const actions = [action].concat(ALL_ACTIONS.filter(a => a.parent === action));
    const executionPlan = processes
      .map(p => {
        const edge = this.edges.find(e => e.state === p.state && actions.includes(e.action) && e.action.checkConnections([p.connection]) && e.action.checkDirections([p.direction]) && e.action.checkOrigins([p.origin]));
        return { process: p, action: edge?.action, nextState: edge?.nextState };
      })
      .filter(({ action, nextState }) => action && nextState)
      .map(({ process, action, nextState }) => ({ process, action: action!, nextState: nextState! }));
    const emails = new Map<string, Set<string>>();
    executionPlan.forEach(({ process, action, nextState }) => {
      const partner = process.findPartner(release);
      if (partner && action.isEmailAction) {
        emails.set(action.emailTemplateID, (emails.get(action.emailTemplateID) ?? new Set()).add(partner.id));
      }
      if (action.savesState) {
        release = release.updateProcess(process.id, draft => {
          draft.savedState = draft.state;
        });
      }
      if (action.restoresState) {
        release = release.setProcessState(process, process.savedState);
      } else if (nextState !== State._SAME_) {
        release = release.setProcessState(process, nextState);
      }
    });
    const emailLogs: string[] = [];
    emails.forEach((partnerIDs, emailTemplateID) => {
      partnerIDs.forEach(pID => {
        const partner = release.partners.find(p => p.id === pID);
        if (partner) {
          console.log(`${partner.name} → ${emailTemplateID}`);
          emailLogs.push(`${partner.name} → ${emailTemplateID}`);
        }
      });
    });
    return { release, emailLogs };
  }
}

export const WORKFLOW = new Workflow([
  //
  new Edge(State.START, Action.SEND_MIGRATION_LETTER_AS2, State.MIGRATION_LETTER_SENT),
  new Edge(State.START, Action.SEND_MIGRATION_LETTER_SFTP, State.MIGRATION_LETTER_SENT),
  new Edge(State.START, Action.SEND_MIGRATION_LETTER_HTTP, State.MIGRATION_LETTER_SENT),
  new Edge(State.START, Action.SEND_MIGRATION_LETTER_VAN, State.MIGRATION_LETTER_SENT),
  new Edge(State.START, Action.EJECT, State.EJECTED),
  new Edge(State.START, Action.POSTPONE_MIGRATION, State.MIGRATION_POSTPONED),
  new Edge(State.START, Action.SEND_EMAIL, State._SAME_),
  //
  new Edge(State.MIGRATION_LETTER_SENT, Action.SEND_REMINDER_MIGRATION_LETTER_AS2, State._SAME_),
  new Edge(State.MIGRATION_LETTER_SENT, Action.SEND_REMINDER_MIGRATION_LETTER_SFTP, State._SAME_),
  new Edge(State.MIGRATION_LETTER_SENT, Action.SEND_REMINDER_MIGRATION_LETTER_HTTP, State._SAME_),
  new Edge(State.MIGRATION_LETTER_SENT, Action.SEND_REMINDER_MIGRATION_LETTER_VAN, State._SAME_),
  new Edge(State.MIGRATION_LETTER_SENT, Action.RECEIVE_CONNECTION_INFO, State.CONNECTION_INFO_RECEIVED),
  new Edge(State.MIGRATION_LETTER_SENT, Action.REQUEST_CONNECTION_INFO_AS2, State.CONNECTION_INFO_REQUESTED),
  new Edge(State.MIGRATION_LETTER_SENT, Action.REQUEST_CONNECTION_INFO_SFTP, State.CONNECTION_INFO_REQUESTED),
  new Edge(State.MIGRATION_LETTER_SENT, Action.REQUEST_CONNECTION_INFO_HTTP, State.CONNECTION_INFO_REQUESTED),
  new Edge(State.MIGRATION_LETTER_SENT, Action.RECEIVE_ACKNOWLEDGEMENT_MIGRATION_LETTER, State.MIGRATION_LETTER_ACKNOWLEDGED),
  new Edge(State.MIGRATION_LETTER_SENT, Action.EJECT, State.EJECTED),
  new Edge(State.MIGRATION_LETTER_SENT, Action.POSTPONE_MIGRATION, State.MIGRATION_POSTPONED),
  new Edge(State.MIGRATION_LETTER_SENT, Action.SEND_EMAIL, State._SAME_),
  new Edge(State.MIGRATION_LETTER_SENT, Action.CHANGE_MIGRATION_DATE, State._SAME_),
  //
  new Edge(State.MIGRATION_LETTER_ACKNOWLEDGED, Action.MARK_CONNECTION_OK, State.CONNECTION_OK),
  new Edge(State.MIGRATION_LETTER_ACKNOWLEDGED, Action.MARK_CONNECTION_FAILED, State.CONNECTION_FAILED),
  new Edge(State.MIGRATION_LETTER_ACKNOWLEDGED, Action.EJECT, State.EJECTED),
  new Edge(State.MIGRATION_LETTER_ACKNOWLEDGED, Action.POSTPONE_MIGRATION, State.MIGRATION_POSTPONED),
  new Edge(State.MIGRATION_LETTER_ACKNOWLEDGED, Action.SEND_EMAIL, State._SAME_),
  new Edge(State.MIGRATION_LETTER_ACKNOWLEDGED, Action.CHANGE_MIGRATION_DATE, State._SAME_),
  //
  new Edge(State.CONNECTION_INFO_REQUESTED, Action.SEND_REMINDER_CONNECTION_INFO_AS2, State._SAME_),
  new Edge(State.CONNECTION_INFO_REQUESTED, Action.SEND_REMINDER_CONNECTION_INFO_SFTP, State._SAME_),
  new Edge(State.CONNECTION_INFO_REQUESTED, Action.SEND_REMINDER_CONNECTION_INFO_HTTP, State._SAME_),
  new Edge(State.CONNECTION_INFO_REQUESTED, Action.RECEIVE_CONNECTION_INFO, State.CONNECTION_INFO_RECEIVED),
  new Edge(State.CONNECTION_INFO_REQUESTED, Action.EJECT, State.EJECTED),
  new Edge(State.CONNECTION_INFO_REQUESTED, Action.POSTPONE_MIGRATION, State.MIGRATION_POSTPONED),
  new Edge(State.CONNECTION_INFO_REQUESTED, Action.SEND_EMAIL, State._SAME_),
  new Edge(State.CONNECTION_INFO_REQUESTED, Action.CHANGE_MIGRATION_DATE, State._SAME_),
  //
  new Edge(State.CONNECTION_INFO_RECEIVED, Action.MARK_CONNECTION_OK, State.CONNECTION_OK),
  new Edge(State.CONNECTION_INFO_RECEIVED, Action.MARK_CONNECTION_FAILED, State.CONNECTION_FAILED),
  new Edge(State.CONNECTION_INFO_RECEIVED, Action.EJECT, State.EJECTED),
  new Edge(State.CONNECTION_INFO_RECEIVED, Action.POSTPONE_MIGRATION, State.MIGRATION_POSTPONED),
  new Edge(State.CONNECTION_INFO_RECEIVED, Action.SEND_EMAIL, State._SAME_),
  new Edge(State.CONNECTION_INFO_RECEIVED, Action.CHANGE_MIGRATION_DATE, State._SAME_),
  //
  new Edge(State.CONNECTION_FAILED, Action.SUGGEST_CONNECTION_TEST_DATE, State.CONNECTION_TEST_DATE_SUGGESTED),
  new Edge(State.CONNECTION_FAILED, Action.MARK_CONNECTION_OK, State.CONNECTION_OK),
  new Edge(State.CONNECTION_FAILED, Action.EJECT, State.EJECTED),
  new Edge(State.CONNECTION_FAILED, Action.POSTPONE_MIGRATION, State.MIGRATION_POSTPONED),
  new Edge(State.CONNECTION_FAILED, Action.SEND_EMAIL, State._SAME_),
  new Edge(State.CONNECTION_FAILED, Action.CHANGE_MIGRATION_DATE, State._SAME_),
  //
  new Edge(State.CONNECTION_TEST_DATE_SUGGESTED, Action.SEND_REMINDER_CONNECTION_TEST_DATE, State._SAME_),
  new Edge(State.CONNECTION_TEST_DATE_SUGGESTED, Action.CONFIRM_CONNECTION_TEST_DATE, State.CONNECTION_TEST_DATE_CONFIRMED),
  new Edge(State.CONNECTION_TEST_DATE_SUGGESTED, Action.EJECT, State.EJECTED),
  new Edge(State.CONNECTION_TEST_DATE_SUGGESTED, Action.POSTPONE_MIGRATION, State.MIGRATION_POSTPONED),
  new Edge(State.CONNECTION_TEST_DATE_SUGGESTED, Action.SEND_EMAIL, State._SAME_),
  new Edge(State.CONNECTION_TEST_DATE_SUGGESTED, Action.CHANGE_MIGRATION_DATE, State._SAME_),
  //
  new Edge(State.CONNECTION_TEST_DATE_CONFIRMED, Action.MARK_CONNECTION_OK, State.CONNECTION_OK),
  new Edge(State.CONNECTION_TEST_DATE_CONFIRMED, Action.MARK_CONNECTION_FAILED, State.CONNECTION_FAILED),
  new Edge(State.CONNECTION_TEST_DATE_CONFIRMED, Action.EJECT, State.EJECTED),
  new Edge(State.CONNECTION_TEST_DATE_CONFIRMED, Action.POSTPONE_MIGRATION, State.MIGRATION_POSTPONED),
  new Edge(State.CONNECTION_TEST_DATE_CONFIRMED, Action.SEND_EMAIL, State._SAME_),
  new Edge(State.CONNECTION_TEST_DATE_CONFIRMED, Action.CHANGE_MIGRATION_DATE, State._SAME_),
  //
  new Edge(State.CONNECTION_OK, Action.SEND_GOLIVE_T14_LETTER, State.GOLIVE_T14_LETTER_SENT),
  new Edge(State.CONNECTION_OK, Action.REQUEST_CONNECTION_INFO_AS2, State.CONNECTION_INFO_REQUESTED),
  new Edge(State.CONNECTION_OK, Action.REQUEST_CONNECTION_INFO_SFTP, State.CONNECTION_INFO_REQUESTED),
  new Edge(State.CONNECTION_OK, Action.REQUEST_CONNECTION_INFO_HTTP, State.CONNECTION_INFO_REQUESTED),
  new Edge(State.CONNECTION_OK, Action.MARK_CONNECTION_FAILED, State.CONNECTION_FAILED),
  new Edge(State.CONNECTION_OK, Action.EJECT, State.EJECTED),
  new Edge(State.CONNECTION_OK, Action.POSTPONE_MIGRATION, State.MIGRATION_POSTPONED),
  new Edge(State.CONNECTION_OK, Action.SEND_EMAIL, State._SAME_),
  new Edge(State.CONNECTION_OK, Action.CHANGE_MIGRATION_DATE, State._SAME_),
  //
  new Edge(State.GOLIVE_T14_LETTER_SENT, Action.RECEIVE_ACKNOWLEDGEMENT, State.GOLIVE_T14_LETTER_ACKNOWLEDGED),
  new Edge(State.GOLIVE_T14_LETTER_SENT, Action.SEND_REMINDER_GOLIVE_T14_LETTER, State._SAME_),
  new Edge(State.GOLIVE_T14_LETTER_SENT, Action.MARK_CONNECTION_FAILED, State.CONNECTION_FAILED),
  new Edge(State.GOLIVE_T14_LETTER_SENT, Action.EJECT, State.EJECTED),
  new Edge(State.GOLIVE_T14_LETTER_SENT, Action.POSTPONE_MIGRATION, State.MIGRATION_POSTPONED),
  new Edge(State.GOLIVE_T14_LETTER_SENT, Action.SEND_EMAIL, State._SAME_),
  new Edge(State.GOLIVE_T14_LETTER_SENT, Action.CHANGE_MIGRATION_DATE, State._SAME_),
  //
  new Edge(State.GOLIVE_T14_LETTER_ACKNOWLEDGED, Action.SEND_GOLIVE_T5_LETTER, State.GOLIVE_T5_LETTER_SENT),
  new Edge(State.GOLIVE_T14_LETTER_ACKNOWLEDGED, Action.MARK_CONNECTION_FAILED, State.CONNECTION_FAILED),
  new Edge(State.GOLIVE_T14_LETTER_ACKNOWLEDGED, Action.EJECT, State.EJECTED),
  new Edge(State.GOLIVE_T14_LETTER_ACKNOWLEDGED, Action.POSTPONE_MIGRATION, State.MIGRATION_POSTPONED),
  new Edge(State.GOLIVE_T14_LETTER_ACKNOWLEDGED, Action.SEND_EMAIL, State._SAME_),
  new Edge(State.GOLIVE_T14_LETTER_ACKNOWLEDGED, Action.CHANGE_MIGRATION_DATE, State._SAME_),
  //
  new Edge(State.GOLIVE_T5_LETTER_SENT, Action.RECEIVE_ACKNOWLEDGEMENT, State.GOLIVE_T5_LETTER_ACKNOWLEDGED),
  new Edge(State.GOLIVE_T5_LETTER_SENT, Action.SEND_REMINDER_GOLIVE_T5_LETTER, State._SAME_),
  new Edge(State.GOLIVE_T5_LETTER_SENT, Action.MARK_CONNECTION_FAILED, State.CONNECTION_FAILED),
  new Edge(State.GOLIVE_T5_LETTER_SENT, Action.EJECT, State.EJECTED),
  new Edge(State.GOLIVE_T5_LETTER_SENT, Action.POSTPONE_MIGRATION, State.MIGRATION_POSTPONED),
  new Edge(State.GOLIVE_T5_LETTER_SENT, Action.SEND_EMAIL, State._SAME_),
  new Edge(State.GOLIVE_T5_LETTER_SENT, Action.CHANGE_MIGRATION_DATE, State._SAME_),
  //
  new Edge(State.GOLIVE_T5_LETTER_ACKNOWLEDGED, Action.SEND_GOLIVE_T1_LETTER, State.GOLIVE_T1_LETTER_SENT),
  new Edge(State.GOLIVE_T5_LETTER_ACKNOWLEDGED, Action.MARK_CONNECTION_FAILED, State.CONNECTION_FAILED),
  new Edge(State.GOLIVE_T5_LETTER_ACKNOWLEDGED, Action.EJECT, State.EJECTED),
  new Edge(State.GOLIVE_T5_LETTER_ACKNOWLEDGED, Action.POSTPONE_MIGRATION, State.MIGRATION_POSTPONED),
  new Edge(State.GOLIVE_T5_LETTER_ACKNOWLEDGED, Action.SEND_EMAIL, State._SAME_),
  new Edge(State.GOLIVE_T5_LETTER_ACKNOWLEDGED, Action.CHANGE_MIGRATION_DATE, State._SAME_),
  //
  new Edge(State.GOLIVE_T1_LETTER_SENT, Action.RECEIVE_ACKNOWLEDGEMENT, State.GOLIVE_T1_LETTER_ACKNOWLEDGED),
  new Edge(State.GOLIVE_T1_LETTER_SENT, Action.SEND_REMINDER_GOLIVE_T1_LETTER, State._SAME_),
  new Edge(State.GOLIVE_T1_LETTER_SENT, Action.MARK_CONNECTION_FAILED, State.CONNECTION_FAILED),
  new Edge(State.GOLIVE_T1_LETTER_SENT, Action.EJECT, State.EJECTED),
  new Edge(State.GOLIVE_T1_LETTER_SENT, Action.POSTPONE_MIGRATION, State.MIGRATION_POSTPONED),
  new Edge(State.GOLIVE_T1_LETTER_SENT, Action.SEND_EMAIL, State._SAME_),
  new Edge(State.GOLIVE_T1_LETTER_SENT, Action.CHANGE_MIGRATION_DATE, State._SAME_),
  //
  new Edge(State.GOLIVE_T1_LETTER_ACKNOWLEDGED, Action.MARK_GOLIVE, State.GOLIVE),
  new Edge(State.GOLIVE_T1_LETTER_ACKNOWLEDGED, Action.MARK_CONNECTION_FAILED, State.CONNECTION_FAILED),
  new Edge(State.GOLIVE_T1_LETTER_ACKNOWLEDGED, Action.EJECT, State.EJECTED),
  new Edge(State.GOLIVE_T1_LETTER_ACKNOWLEDGED, Action.POSTPONE_MIGRATION, State.MIGRATION_POSTPONED),
  new Edge(State.GOLIVE_T1_LETTER_ACKNOWLEDGED, Action.SEND_EMAIL, State._SAME_),
  new Edge(State.GOLIVE_T1_LETTER_ACKNOWLEDGED, Action.CHANGE_MIGRATION_DATE, State._SAME_),
  //
  new Edge(State.GOLIVE, Action.SEND_GOLIVE_LOAD_LETTER, State.GOLIVE_LOAD_LETTER_SENT),
  new Edge(State.GOLIVE, Action.MARK_CONNECTION_FAILED, State.CONNECTION_FAILED),
  new Edge(State.GOLIVE, Action.MARK_RELEASE_COMPLETE, State.RELEASE_COMPLETE),
  new Edge(State.GOLIVE, Action.SEND_EMAIL, State._SAME_),
  //
  new Edge(State.GOLIVE_LOAD_LETTER_SENT, Action.MARK_RELEASE_COMPLETE, State.RELEASE_COMPLETE),
  new Edge(State.GOLIVE_LOAD_LETTER_SENT, Action.SEND_REMINDER_GOLIVE_LOAD_LETTER, State._SAME_),
  new Edge(State.GOLIVE_LOAD_LETTER_SENT, Action.MARK_CONNECTION_FAILED, State.CONNECTION_FAILED),
  new Edge(State.GOLIVE_LOAD_LETTER_SENT, Action.SEND_EMAIL, State._SAME_),
  //
  new Edge(State.RELEASE_COMPLETE, Action.SEND_EMAIL, State._SAME_),
  //
  new Edge(State.MIGRATION_POSTPONED, Action.RESTART_MIGRATION, State._DUMMY_),
  new Edge(State.MIGRATION_POSTPONED, Action.SEND_EMAIL, State._SAME_),
  new Edge(State.MIGRATION_POSTPONED, Action.EJECT, State.EJECTED),
]);
