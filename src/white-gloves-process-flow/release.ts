import { immerable, produce } from 'immer';
import { flatten, uniq } from 'lodash';
import { Connection, Direction, FnRecipe, Origin } from './types';
import { State } from './state';
import { Partner } from './partner';
import { Process } from './process';

export class Release {
  [immerable] = true;
  readonly name: string;
  readonly partners: Partner[];
  constructor(name: string, partners: Partner[]) {
    this.name = name;
    this.partners = partners;
  }
  getEjectedPartners(): Partner[] {
    return this.partners.filter(partner => partner.getEjectedProcesses().length === partner.processes.length);
  }
  getPartiallyEjectedPartners(): Partner[] {
    return this.partners.filter(partner => partner.getEjectedProcesses().length !== 0);
  }
  getCheckedPartners(): Partner[] {
    return this.partners.filter(partner => partner.checked !== false);
  }
  getCheckedProcesses(): Process[] {
    return flatten(this.getCheckedPartners().map(partner => partner.processes));
  }
  getProcesses(partners?: Partner[]): Process[] {
    return flatten((partners ?? this.partners).map(partner => partner.processes));
  }
  update(recipe: FnRecipe<Release>) {
    return produce(this, recipe);
  }
  updatePartner(partnerID: string, recipe: FnRecipe<Partner>): Release {
    return this.update(draft => {
      draft.partners = draft.partners.map(partner => {
        if (partner.id !== partnerID) return partner;
        return partner.update(recipe);
      });
    });
  }
  updateProcess(processID: string, recipe: FnRecipe<Process>): Release {
    return this.update(draft => {
      draft.partners = draft.partners.map(partner => {
        if (partner.processes.every(process => process.id !== processID)) return partner;
        return partner.updateProcess(processID, recipe);
      });
    });
  }
  setPartnerState(releasePartner: Partner, state: State): Release {
    return this.update(draft => {
      draft.partners = draft.partners.map(partner => {
        if (partner.id !== releasePartner.id) return partner;
        return partner.setState(state);
      });
    });
  }
  setAllPartnerState(state: State): Release {
    return this.update(draft => {
      draft.partners = draft.partners.map(partner => {
        return partner.setState(state);
      });
    });
  }
  setAllPartnersChecked(checked: boolean): Release {
    return this.update(draft => {
      draft.partners = draft.partners.map(partner => {
        return partner.setChecked(checked);
      });
    });
  }
  setPartnerChecked(releasePartner: Partner, checked: boolean): Release {
    return this.update(draft => {
      draft.partners = draft.partners.map(partner => {
        if (partner.id !== releasePartner.id) return partner;
        return partner.setChecked(checked);
      });
    });
  }
  setProcessState(partnerProcess: Process, state: State): Release {
    if (partnerProcess.state === state) return this;
    return this.update(draft => {
      draft.partners = draft.partners.map(partner => {
        if (!partner.hasProcess(partnerProcess)) return partner;
        return partner.setProcessState(partnerProcess, state);
      });
    });
  }
  purgeEjectedProcesses(): Release {
    return this.update(draft => {
      draft.partners = draft.partners.map(partner => partner.purgeEjectedProcesses()).filter(partner => partner.processes.length !== 0);
    });
  }
  findPartnersForProcesses(processes: Process[]): Partner[] {
    return uniq(
      processes
        .map(process => process.findPartner(this))
        .filter(partner => !!partner)
        .map(partner => partner!),
    );
  }
}

export const RELEASE = new Release('Release P1', [
  new Partner('AS2_PARTNER', 'AS2 Partner', false, [
    //
    new Process('AS2_PROCESS_1', '8xx EDI Inbound', State.START, Connection.AS2, Direction.INBOUND, Origin.BOTH),
    new Process('AS2_PROCESS_2', '8xx EDI Outbound', State.START, Connection.AS2, Direction.OUTBOUND, Origin.BOTH),
  ]),
  new Partner('SFTP_INT_PARTNER', 'SFTP Internal Partner', false, [
    //
    new Process('SFTP_INT_PROCESS_1', '8xx EDI Inbound', State.START, Connection.SFTP, Direction.INBOUND, Origin.INTERNAL),
    new Process('SFTP_INT_PROCESS_2', '8xx EDI Outbound', State.START, Connection.SFTP, Direction.OUTBOUND, Origin.INTERNAL),
  ]),
  new Partner('SFTP_EXT_PARTNER', 'SFTP External Partner', false, [
    //
    new Process('SFTP_EXT_PROCESS_1', '8xx EDI Inbound', State.START, Connection.SFTP, Direction.INBOUND, Origin.EXTERNAL),
    new Process('SFTP_EXT_PROCESS_2', '8xx EDI Outbound', State.START, Connection.SFTP, Direction.OUTBOUND, Origin.EXTERNAL),
  ]),
  new Partner('HTTP_PARTNER', 'HTTP Partner', false, [
    //
    new Process('HTTP_PROCESS_1', '8xx EDI Inbound', State.START, Connection.HTTP, Direction.INBOUND, Origin.EXTERNAL),
    new Process('HTTP_PROCESS_2', '8xx EDI Outbound', State.START, Connection.HTTP, Direction.OUTBOUND, Origin.EXTERNAL),
  ]),
  new Partner('VAN_PARTNER', 'VAN Partner', false, [
    //
    new Process('VAN_PROCESS_1', '8xx EDI Inbound', State.START, Connection.VAN, Direction.INBOUND, Origin.INTERNAL),
    new Process('VAN_PROCESS_2', '8xx EDI Outbound', State.START, Connection.VAN, Direction.OUTBOUND, Origin.INTERNAL),
  ]),
  new Partner('ASIM_AS2', 'Asim', false, [
    new Process('AS2_PROCESS_1', '8xx EDI Inbound', State.START, Connection.AS2, Direction.INBOUND, Origin.BOTH),
    new Process('AS2_PROCESS_2', '8xx EDI Outbound', State.START, Connection.AS2, Direction.OUTBOUND, Origin.BOTH),
    new Process('SFTP_INT_PROCESS_1', '8xx EDI Inbound', State.START, Connection.SFTP, Direction.INBOUND, Origin.INTERNAL),
    new Process('SFTP_INT_PROCESS_2', '8xx EDI Outbound', State.START, Connection.SFTP, Direction.OUTBOUND, Origin.INTERNAL),
    new Process('SFTP_EXT_PROCESS_1', '8xx EDI Inbound', State.START, Connection.SFTP, Direction.INBOUND, Origin.EXTERNAL),
    new Process('SFTP_EXT_PROCESS_2', '8xx EDI Outbound', State.START, Connection.SFTP, Direction.OUTBOUND, Origin.EXTERNAL),
    new Process('HTTP_PROCESS_1', '8xx EDI Inbound', State.START, Connection.HTTP, Direction.INBOUND, Origin.EXTERNAL),
    new Process('HTTP_PROCESS_2', '8xx EDI Outbound', State.START, Connection.HTTP, Direction.OUTBOUND, Origin.EXTERNAL),
    new Process('VAN_PROCESS_1', '8xx EDI Inbound', State.START, Connection.VAN, Direction.INBOUND, Origin.INTERNAL),
    new Process('VAN_PROCESS_2', '8xx EDI Outbound', State.START, Connection.VAN, Direction.OUTBOUND, Origin.INTERNAL),
  ]),
]);
