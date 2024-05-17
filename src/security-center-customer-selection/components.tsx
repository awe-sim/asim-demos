import { Button, Card, CardContent, Checkbox, FormControlLabel, Grid, List, ListItem, ListItemButton, ListSubheader, Typography } from '@mui/material';
import { enableMapSet } from 'immer';
import { atom, useRecoilState } from 'recoil';
import { Customer, rootState, Subscription } from './core';
import { useCallback } from 'react';
import React from 'react';
import { recoilPersist } from 'recoil-persist';

enableMapSet();

const { persistAtom } = recoilPersist();

const alternateState = atom<boolean>({
  key: 'alternateState',
  default: false,
  effects_UNSTABLE: [persistAtom],
});

export const CustomerSelection: React.FC = () => {
  const [alternate, setAlternate] = useRecoilState(alternateState);

  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={alternate}
            onChange={ev => setAlternate(ev.target.checked)}
          />
        }
        label="Alternate Option"
      />
      {!alternate && (
        <Grid
          container
          spacing={2}>
          <CustomersComponent />
          <Grid
            item
            xs={6}>
            <Grid
              container
              spacing={2}>
              <SubscriptionsComponent />
              <CompaniesComponent />
              <EnvironmentsComponent />
            </Grid>
          </Grid>
        </Grid>
      )}
      {alternate && (
        <Grid
          container
          spacing={2}>
          <CustomersComponent />
          <CustomerDetailsComponent />
        </Grid>
      )}
    </>
  );
};

const CustomersComponent: React.FC = () => {
  const [root, setRoot] = useRecoilState(rootState);

  const selectAllCustomers = useCallback(() => setRoot(r => r.checkAllCustomers(true)), [setRoot]);
  const selectNoneCustomers = useCallback(() => setRoot(r => r.checkAllCustomers(false)), [setRoot]);

  const addCustomer = useCallback(() => {
    setRoot(r => r.addCustomer());
  }, [setRoot]);

  return (
    <Grid
      item
      xs={6}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h6">Customers</Typography>
          <Button
            onClick={selectAllCustomers}
            size="small"
            variant="outlined">
            Select All
          </Button>
          <Button
            onClick={selectNoneCustomers}
            size="small"
            variant="outlined">
            Select None
          </Button>
          <Button
            onClick={addCustomer}
            size="small"
            variant="outlined">
            + Customer
          </Button>
          <List dense>
            {root.customers.map(customer => (
              <ListItem
                disablePadding
                key={customer.id}>
                <Checkbox
                  checked={root.isCustomerChecked(customer)}
                  indeterminate={root.isCustomerChecked(customer) === undefined}
                  onChange={ev => setRoot(r => r.setCustomerChecked(customer, ev.target.checked))}
                />
                <ListItemButton
                  key={customer.id}
                  selected={root.selectedCustomer === customer}
                  onClick={() => setRoot(r => r.selectCustomer(customer))}>
                  {customer.name}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Grid>
  );
};

const SubscriptionsComponent: React.FC = () => {
  const [root, setRoot] = useRecoilState(rootState);

  const selectAllSubscriptions = useCallback(() => setRoot(r => r.checkAllSubscriptions(r.selectedCustomer, true)), [setRoot]);
  const selectNoneSubscriptions = useCallback(() => setRoot(r => r.checkAllSubscriptions(r.selectedCustomer, false)), [setRoot]);
  const addSubscription = useCallback(
    (customer: Customer) => {
      setRoot(r => r.addSubscription(customer));
    },
    [setRoot],
  );

  return (
    <Grid
      item
      xs={12}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h6">Subscriptions for {root.selectedCustomer.name}</Typography>
          <Button
            onClick={selectAllSubscriptions}
            size="small"
            variant="outlined">
            Select All
          </Button>
          <Button
            onClick={selectNoneSubscriptions}
            size="small"
            variant="outlined">
            Select None
          </Button>
          <Button
            onClick={() => addSubscription(root.selectedCustomer)}
            disabled={root.selectedCustomer.isFutureEntity}
            size="small"
            variant="outlined">
            + Subscription
          </Button>
          <List dense>
            {root.selectedCustomer.subscriptions.map(subscription => (
              <ListItem
                disablePadding
                key={subscription.id}>
                <Checkbox
                  checked={root.isSubscriptionChecked(subscription)}
                  indeterminate={root.isSubscriptionChecked(subscription) === undefined}
                  onChange={ev => setRoot(r => r.setSubscriptionChecked(subscription, ev.target.checked))}
                />
                <ListItemButton
                  key={subscription.id}
                  selected={root.selectedSubscription === subscription}
                  onClick={() => setRoot(r => r.selectSubscription(subscription))}>
                  {subscription.name}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Grid>
  );
};

const CompaniesComponent: React.FC = () => {
  const [root, setRoot] = useRecoilState(rootState);

  const selectAllCompanies = useCallback(() => setRoot(r => r.checkAllCompanies(r.selectedSubscription, true)), [setRoot]);
  const selectNoneCompanies = useCallback(() => setRoot(r => r.checkAllCompanies(r.selectedSubscription, false)), [setRoot]);

  const addCompany = useCallback(
    (subscription: Subscription) => {
      setRoot(r => r.addCompany(subscription));
    },
    [setRoot],
  );

  return (
    <Grid
      item
      xs={12}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h6">
            Companies for {root.selectedCustomer.name} ({root.selectedSubscription.name})
          </Typography>
          <Button
            onClick={selectAllCompanies}
            size="small"
            variant="outlined">
            Select All
          </Button>
          <Button
            onClick={selectNoneCompanies}
            size="small"
            variant="outlined">
            Select None
          </Button>
          <Button
            onClick={() => addCompany(root.selectedSubscription)}
            disabled={root.selectedSubscription.isFutureEntity}
            size="small"
            variant="outlined">
            + Company
          </Button>
          <List dense>
            {root.selectedSubscription.companies.map(company => (
              <ListItem
                disablePadding
                key={company.id}>
                <Checkbox
                  checked={root.isCompanyChecked(company)}
                  indeterminate={root.isCompanyChecked(company) === undefined}
                  onChange={ev => setRoot(r => r.setCompanyChecked(company, ev.target.checked))}
                />
                <ListItemButton key={company.id}>{company.name}</ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Grid>
  );
};

const EnvironmentsComponent: React.FC = () => {
  const [root, setRoot] = useRecoilState(rootState);

  const selectAllEnvironments = useCallback(() => setRoot(r => r.checkAllEnvironments(r.selectedSubscription, true)), [setRoot]);
  const selectNoneEnvironments = useCallback(() => setRoot(r => r.checkAllEnvironments(r.selectedSubscription, false)), [setRoot]);

  const addEnvironment = useCallback(
    (subscription: Subscription) => {
      setRoot(r => r.addEnvironment(subscription));
    },
    [setRoot],
  );

  return (
    <Grid
      item
      xs={12}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h6">
            Environments for {root.selectedCustomer.name} ({root.selectedSubscription.name})
          </Typography>
          <Button
            onClick={selectAllEnvironments}
            size="small"
            variant="outlined">
            Select All
          </Button>
          <Button
            onClick={selectNoneEnvironments}
            size="small"
            variant="outlined">
            Select None
          </Button>
          <Button
            onClick={() => addEnvironment(root.selectedSubscription)}
            disabled={root.selectedSubscription.isFutureEntity}
            size="small"
            variant="outlined">
            + Environment
          </Button>
          <List dense>
            {root.selectedSubscription.environments.map(environment => (
              <ListItem
                disablePadding
                key={environment.id}>
                <Checkbox
                  checked={root.isEnvironmentChecked(environment)}
                  indeterminate={root.isEnvironmentChecked(environment) === undefined}
                  onChange={ev => setRoot(r => r.setEnvironmentChecked(environment, ev.target.checked))}
                />
                <ListItemButton key={environment.id}>{environment.name}</ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Grid>
  );
};

const CustomerDetailsComponent: React.FC = () => {
  const [root, setRoot] = useRecoilState(rootState);

  const selectAllSubscriptions = useCallback(() => setRoot(r => r.checkAllSubscriptions(r.selectedCustomer, true)), [setRoot]);
  const selectNoneSubscriptions = useCallback(() => setRoot(r => r.checkAllSubscriptions(r.selectedCustomer, false)), [setRoot]);

  const addSubscription = useCallback(
    (customer: Customer) => {
      setRoot(r => r.addSubscription(customer));
    },
    [setRoot],
  );

  const addCompany = useCallback(
    (subscription: Subscription) => {
      setRoot(r => r.addCompany(subscription));
    },
    [setRoot],
  );
  const addEnvironment = useCallback(
    (subscription: Subscription) => {
      setRoot(r => r.addEnvironment(subscription));
    },
    [setRoot],
  );

  return (
    <Grid
      item
      xs={6}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h6">{root.selectedCustomer.name}</Typography>
          <Button
            onClick={selectAllSubscriptions}
            size="small"
            variant="outlined">
            Select All
          </Button>
          <Button
            onClick={selectNoneSubscriptions}
            size="small"
            variant="outlined">
            Select None
          </Button>
          <Button
            onClick={() => addSubscription(root.selectedCustomer)}
            disabled={root.selectedCustomer.isFutureEntity}
            size="small"
            variant="outlined">
            + Subscription
          </Button>
          <Button
            onClick={() => addCompany(root.selectedSubscription)}
            disabled={root.selectedSubscription.isFutureEntity}
            size="small"
            variant="outlined">
            + Company
          </Button>
          <Button
            onClick={() => addEnvironment(root.selectedSubscription)}
            disabled={root.selectedSubscription.isFutureEntity}
            size="small"
            variant="outlined">
            + Environment
          </Button>
          <List dense>
            {root.selectedCustomer.subscriptions.map(subscription => (
              <div key={subscription.id}>
                <ListItem disablePadding>
                  <Checkbox
                    checked={root.isSubscriptionChecked(subscription)}
                    indeterminate={root.isSubscriptionChecked(subscription) === undefined}
                    onChange={ev => setRoot(r => r.setSubscriptionChecked(subscription, ev.target.checked))}
                  />
                  <ListItemButton
                    key={subscription.id}
                    selected={root.selectedSubscription === subscription}
                    onClick={() => setRoot(r => r.selectSubscription(subscription))}>
                    {subscription.name}
                  </ListItemButton>
                </ListItem>
                <ListSubheader style={{ height: 30, paddingLeft: 40 }}>Companies</ListSubheader>
                {subscription.companies.map(company => (
                  <ListItem
                    disablePadding
                    key={company.id}>
                    <span style={{ width: 30 }} />
                    <Checkbox
                      checked={root.isCompanyChecked(company)}
                      indeterminate={root.isCompanyChecked(company) === undefined}
                      onChange={ev => setRoot(r => r.setCompanyChecked(company, ev.target.checked))}
                    />
                    <ListItemButton key={company.id}>{company.name}</ListItemButton>
                  </ListItem>
                ))}
                <ListSubheader style={{ height: 30, paddingLeft: 40 }}>Environments</ListSubheader>
                {subscription.environments.map(environment => (
                  <ListItem
                    disablePadding
                    key={environment.id}>
                    <span style={{ width: 30 }} />
                    <Checkbox
                      checked={root.isEnvironmentChecked(environment)}
                      indeterminate={root.isEnvironmentChecked(environment) === undefined}
                      onChange={ev => setRoot(r => r.setEnvironmentChecked(environment, ev.target.checked))}
                    />
                    <ListItemButton key={environment.id}>{environment.name}</ListItemButton>
                  </ListItem>
                ))}
              </div>
            ))}
          </List>
        </CardContent>
      </Card>
    </Grid>
  );
};
