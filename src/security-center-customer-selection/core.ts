import { immerable, produce } from 'immer';
import { atom } from 'recoil';

let id = 0;
function uniqueId(prefix?: string): string {
  return `${prefix}${++id}`;
}

export class Root {
  [immerable] = true;
  readonly customers: Customer[];
  readonly checkedCompanies: Set<Company> = new Set();
  readonly checkedEnvironments: Set<Environment> = new Set();
  selectedCustomerId: string;
  selectedSubscriptionId: string;

  constructor(customers: Customer[]) {
    if (!customers.find(customer => customer.isFutureEntity)) throw new Error('FutureEntity customer must be present');
    this.customers = customers;
    this.selectedCustomerId = customers[0].id;
    this.selectedSubscriptionId = customers[0].subscriptions[0].id;
  }

  get selectedCustomer() {
    return this.getCustomerById(this.selectedCustomerId)!;
  }
  get selectedSubscription() {
    return this.getSubscriptionById(this.selectedSubscriptionId)!;
  }

  addCustomer() {
    const customer = new Customer(uniqueId(), uniqueId('Customer '), false, [new Subscription(uniqueId(), 'Future Subscriptions', true, [new Company(uniqueId(), 'Future Companies', true)], [new Environment(uniqueId(), 'Future Environments', true)])]);
    const shouldAddCompanies = this.checkedCompanies.has(this.futureCustomer.futureSubscription.futureCompany);
    const shouldAddEnvironments = this.checkedEnvironments.has(this.futureCustomer.futureSubscription.futureEnvironment);
    return produce(this, draft => {
      if (shouldAddCompanies) {
        customer.flatCompanies.forEach(company => draft.checkedCompanies.add(company));
      }
      if (shouldAddEnvironments) {
        customer.flatEnvironments.forEach(environment => draft.checkedEnvironments.add(environment));
      }
      draft.customers.push(customer);
      draft.selectedCustomerId = customer.id;
      draft.selectedSubscriptionId = customer.subscriptions[0].id;
    });
  }

  addSubscription(customer: Customer) {
    const subscription = new Subscription(uniqueId(), uniqueId('Subscription '), false, [new Company(uniqueId(), 'Future Companies', true)], [new Environment(uniqueId(), 'Future Environments', true)]);
    const shouldAddCompanies = this.checkedCompanies.has(customer.futureSubscription.futureCompany);
    const shouldAddEnvironments = this.checkedEnvironments.has(customer.futureSubscription.futureEnvironment);
    return produce(this, draft => {
      if (shouldAddCompanies) {
        subscription.companies.forEach(company => draft.checkedCompanies.add(company));
      }
      if (shouldAddEnvironments) {
        subscription.environments.forEach(environment => draft.checkedEnvironments.add(environment));
      }
      draft.selectedSubscriptionId = subscription.id;
      const c = draft.getCustomerById(customer.id);
      if (c) {
        c.subscriptions.push(subscription);
      }
    });
  }

  addCompany(subscription: Subscription) {
    const company = new Company(uniqueId(), uniqueId('Company '), false);
    return produce(this, draft => {
      if (draft.checkedCompanies.has(subscription.futureCompany)) {
        draft.checkedCompanies.add(company);
      }
      const s = draft.getSubscriptionById(subscription.id);
      if (s) {
        s.companies.push(company);
      }
    });
  }

  addEnvironment(subscription: Subscription) {
    const environment = new Environment(uniqueId(), uniqueId('Environment '), false);
    return produce(this, draft => {
      if (draft.checkedEnvironments.has(subscription.futureEnvironment)) {
        draft.checkedEnvironments.add(environment);
      }
      const s = draft.getSubscriptionById(subscription.id);
      if (s) {
        s.environments.push(environment);
      }
    });
  }

  getCustomerById(id: string) {
    return this.customers.find(customer => customer.id === id);
  }
  getSubscriptionById(id: string) {
    return this.customers.flatMap(customer => customer.subscriptions).find(subscription => subscription.id === id);
  }
  getCompanyById(id: string) {
    return this.customers.flatMap(customer => customer.flatCompanies).find(company => company.id === id);
  }
  getEnvironmentById(id: string) {
    return this.customers.flatMap(customer => customer.flatEnvironments).find(environment => environment.id === id);
  }

  getCustomerForSubscription(subscription: Subscription) {
    return this.customers.find(customer => customer.subscriptions.find(s => s.id === subscription.id));
  }
  getCustomerForCompany(company: Company) {
    return this.customers.find(customer => customer.flatCompanies.find(c => c.id === company.id));
  }
  getCustomerForEnvironment(environment: Environment) {
    return this.customers.find(customer => customer.flatEnvironments.find(e => e.id === environment.id));
  }

  getSubscriptionForCompany(company: Company) {
    return this.customers.flatMap(customer => customer.subscriptions).find(subscription => subscription.companies.find(c => c.id === company.id));
  }
  getSubscriptionForEnvironment(environment: Environment) {
    return this.customers.flatMap(customer => customer.subscriptions).find(subscription => subscription.environments.find(e => e.id === environment.id));
  }

  get futureCustomer() {
    return this.customers.find(customer => customer.isFutureEntity)!;
  }
  get presentCustomers() {
    return this.customers.filter(customer => !customer.isFutureEntity);
  }

  get flatSubscriptions() {
    return this.customers.flatMap(customer => customer.subscriptions);
  }
  get flatCompanies() {
    return this.flatSubscriptions.map(subscription => subscription.companies).flat();
  }
  get flatEnvironments() {
    return this.flatSubscriptions.map(subscription => subscription.environments).flat();
  }

  checkAllCustomers(value: boolean) {
    return produce(this, draft => {
      if (value) {
        draft.flatCompanies.forEach(company => draft.checkedCompanies.add(company));
        draft.flatEnvironments.forEach(environment => draft.checkedEnvironments.add(environment));
      } else {
        draft.checkedCompanies.clear();
        draft.checkedEnvironments.clear();
      }
    });
  }
  checkAllSubscriptions(customer: Customer, value: boolean) {
    return produce(this, draft => {
      customer.subscriptions.forEach(subscription => {
        if (value) {
          subscription.companies.forEach(company => draft.checkedCompanies.add(company));
          subscription.environments.forEach(environment => draft.checkedEnvironments.add(environment));
        } else {
          subscription.companies.forEach(company => draft.checkedCompanies.delete(company));
          subscription.environments.forEach(environment => draft.checkedEnvironments.delete(environment));
        }
      });
    });
  }
  checkAllCompanies(subscription: Subscription, value: boolean) {
    return produce(this, draft => {
      if (value) {
        subscription.companies.forEach(company => draft.checkedCompanies.add(company));
      } else {
        subscription.companies.forEach(company => draft.checkedCompanies.delete(company));
      }
    });
  }
  checkAllEnvironments(subscription: Subscription, value: boolean) {
    return produce(this, draft => {
      if (value) {
        subscription.environments.forEach(environment => draft.checkedEnvironments.add(environment));
      } else {
        subscription.environments.forEach(environment => draft.checkedEnvironments.delete(environment));
      }
    });
  }

  selectCustomer(customer: Customer) {
    return produce(this, draft => {
      draft.selectedCustomerId = customer.id;
      if (draft.getCustomerForSubscription(draft.selectedSubscription) !== customer) {
        draft.selectedSubscriptionId = customer.subscriptions[0].id;
      }
    });
  }
  isCustomerChecked(customer: Customer) {
    const companies = customer.flatCompanies;
    const environments = customer.flatEnvironments;
    const countCheckedCompanies = companies.filter(company => this.checkedCompanies.has(company)).length;
    const countCheckedEnvironments = environments.filter(environment => this.checkedEnvironments.has(environment)).length;
    if (countCheckedCompanies === 0 && countCheckedEnvironments === 0) return false;
    if (countCheckedCompanies === companies.length && countCheckedEnvironments === environments.length) return true;
    return undefined;
  }
  setCustomerChecked(customer: Customer, value: boolean) {
    const companies = customer.flatCompanies;
    const environments = customer.flatEnvironments;
    return produce(this, draft => {
      if (value) {
        companies.forEach(company => draft.checkedCompanies.add(company));
        environments.forEach(environment => draft.checkedEnvironments.add(environment));
      } else {
        companies.forEach(company => draft.checkedCompanies.delete(company));
        environments.forEach(environment => draft.checkedEnvironments.delete(environment));
      }
    });
  }

  selectSubscription(subscription: Subscription) {
    return produce(this, draft => {
      draft.selectedCustomerId = draft.getCustomerForSubscription(subscription)!.id;
      draft.selectedSubscriptionId = subscription.id;
    });
  }
  isSubscriptionChecked(subscription: Subscription) {
    const companies = subscription.companies;
    const environments = subscription.environments;
    const countCheckedCompanies = companies.filter(company => this.checkedCompanies.has(company)).length;
    const countCheckedEnvironments = environments.filter(environment => this.checkedEnvironments.has(environment)).length;
    if (countCheckedCompanies === 0 && countCheckedEnvironments === 0) return false;
    if (countCheckedCompanies === companies.length && countCheckedEnvironments === environments.length) return true;
    return undefined;
  }
  setSubscriptionChecked(subscription: Subscription, value: boolean) {
    const companies = subscription.companies;
    const environments = subscription.environments;
    return produce(this, draft => {
      if (value) {
        companies.forEach(company => draft.checkedCompanies.add(company));
        environments.forEach(environment => draft.checkedEnvironments.add(environment));
      } else {
        companies.forEach(company => draft.checkedCompanies.delete(company));
        environments.forEach(environment => draft.checkedEnvironments.delete(environment));
      }
    });
  }

  isCompanyChecked(company: Company) {
    return this.checkedCompanies.has(company);
  }
  setCompanyChecked(company: Company, value: boolean) {
    return produce(this, draft => {
      if (value) {
        draft.checkedCompanies.add(company);
      } else {
        draft.checkedCompanies.delete(company);
      }
    });
  }

  isEnvironmentChecked(environment: Environment) {
    return this.checkedEnvironments.has(environment);
  }
  setEnvironmentChecked(environment: Environment, value: boolean) {
    return produce(this, draft => {
      if (value) {
        draft.checkedEnvironments.add(environment);
      } else {
        draft.checkedEnvironments.delete(environment);
      }
    });
  }
}

// ------------------------------------------------------------------------------------------------

export class Customer {
  [immerable] = true;
  readonly id: string;
  readonly name: string;
  readonly isFutureEntity: boolean;
  readonly subscriptions: Subscription[];

  constructor(id: string, name: string, isFutureEntity: boolean, subscriptions: Subscription[]) {
    this.id = id;
    this.name = name;
    this.isFutureEntity = isFutureEntity;
    this.subscriptions = subscriptions;
    if (!this.futureSubscription) throw new Error('FutureEntity subscription must be present');
  }

  getSubscriptionById(id: string) {
    return this.subscriptions.find(subscription => subscription.id === id);
  }
  getCompanyById(id: string) {
    return this.subscriptions.flatMap(subscription => subscription.companies).find(company => company.id === id);
  }
  getEnvironmentById(id: string) {
    return this.subscriptions.flatMap(subscription => subscription.environments).find(environment => environment.id === id);
  }

  get futureSubscription() {
    return this.subscriptions.find(subscription => subscription.isFutureEntity)!;
  }
  get presentSubscriptions() {
    return this.subscriptions.filter(subscription => !subscription.isFutureEntity);
  }

  get flatCompanies() {
    return this.subscriptions.flatMap(subscription => subscription.companies);
  }
  get flatEnvironments() {
    return this.subscriptions.flatMap(subscription => subscription.environments);
  }
}

// ------------------------------------------------------------------------------------------------

export class Subscription {
  [immerable] = true;
  readonly id: string;
  readonly name: string;
  readonly isFutureEntity: boolean;
  readonly companies: Company[];
  readonly environments: Environment[];

  constructor(id: string, name: string, isFutureEntity: boolean, companies: Company[], environments: Environment[]) {
    this.id = id;
    this.name = name;
    this.isFutureEntity = isFutureEntity;
    this.companies = companies;
    this.environments = environments;
    if (!this.futureCompany) throw new Error('FutureEntity company must be present');
    if (!this.futureEnvironment) throw new Error('FutureEntity environment must be present');
  }

  getCompanyById(id: string) {
    return this.companies.find(company => company.id === id);
  }
  getEnvironmentById(id: string) {
    return this.environments.find(environment => environment.id === id);
  }

  get futureCompany() {
    return this.companies.find(company => company.isFutureEntity)!;
  }
  get futureEnvironment() {
    return this.environments.find(environment => environment.isFutureEntity)!;
  }
  get presentCompanies() {
    return this.companies.filter(company => !company.isFutureEntity);
  }
  get presentEnvironments() {
    return this.environments.filter(environment => !environment.isFutureEntity);
  }
}

// ------------------------------------------------------------------------------------------------

export class Company {
  [immerable] = true;
  readonly id: string;
  readonly name: string;
  readonly isFutureEntity: boolean;

  constructor(id: string, name: string, isFutureEntity: boolean) {
    this.id = id;
    this.name = name;
    this.isFutureEntity = isFutureEntity;
  }
}

// ------------------------------------------------------------------------------------------------

export class Environment {
  [immerable] = true;
  readonly id: string;
  readonly name: string;
  readonly isFutureEntity: boolean;

  constructor(id: string, name: string, isFutureEntity: boolean) {
    this.id = id;
    this.name = name;
    this.isFutureEntity = isFutureEntity;
  }
}

export const rootState = atom<Root>({
  key: 'root',
  default: new Root([
    //
    new Customer(uniqueId(), 'Customer 1', false, [
      //
      new Subscription( //
        //
        uniqueId(),
        'Subscription 1.1',
        false,
        [new Company(uniqueId(), 'Company 1.1.1', false), new Company(uniqueId(), 'Future Companies', true)],
        [new Environment(uniqueId(), 'Environment 1', false), new Environment(uniqueId(), 'Future Environments', true)],
      ),
      new Subscription(
        //
        uniqueId(),
        'Future Subscriptions',
        true,
        [new Company(uniqueId(), 'Future Companies', true)],
        [new Environment(uniqueId(), 'Future Environments', true)],
      ),
    ]),
    new Customer(uniqueId(), 'Customer 2', false, [
      //
      new Subscription(
        //
        uniqueId(),
        'Subscription 2.1',
        false,
        [new Company(uniqueId(), 'Company 2.1.1', false), new Company(uniqueId(), 'Company 2.1.2', false), new Company(uniqueId(), 'Company 2.1.3', false), new Company(uniqueId(), 'Company 2.1.4', false), new Company(uniqueId(), 'Future Companies', true)],
        [new Environment(uniqueId(), 'Environment 1', false), new Environment(uniqueId(), 'Environment 2', false), new Environment(uniqueId(), 'Future Environments', true)],
      ),
      new Subscription(uniqueId(), 'Future Subscriptions', true, [new Company(uniqueId(), 'Future Companies', true)], [new Environment(uniqueId(), 'Future Environments', true)]),
    ]),
    new Customer(uniqueId(), 'Customer 3', false, [
      //
      new Subscription(
        //
        uniqueId(),
        'Subscription 3.1',
        false,
        [new Company(uniqueId(), 'Company 3.1.1', false), new Company(uniqueId(), 'Company 3.1.2', false), new Company(uniqueId(), 'Company 3.1.3', false), new Company(uniqueId(), 'Company 3.1.4', false), new Company(uniqueId(), 'Future Companies', true)],
        [new Environment(uniqueId(), 'Environment 1', false), new Environment(uniqueId(), 'Environment 2', false), new Environment(uniqueId(), 'Environment 3', false), new Environment(uniqueId(), 'Environment 4', false), new Environment(uniqueId(), 'Future Environments', true)],
      ),
      new Subscription(
        //
        uniqueId(),
        'Subscription 3.2',
        false,
        [new Company(uniqueId(), 'Company 3.2.1', false), new Company(uniqueId(), 'Company 3.2.2', false), new Company(uniqueId(), 'Future Companies', true)],
        [new Environment(uniqueId(), 'Environment 1', false), new Environment(uniqueId(), 'Future Environments', true)],
      ),
      new Subscription(uniqueId(), 'Future Subscriptions', true, [new Company(uniqueId(), 'Future Companies', true)], [new Environment(uniqueId(), 'Future Environments', true)]),
    ]),
    new Customer(uniqueId(), 'Future Customers', true, [new Subscription(uniqueId(), 'Future Subscriptions', true, [new Company(uniqueId(), 'Future Companies', true)], [new Environment(uniqueId(), 'Future Environments', true)])]),
  ]),
});
