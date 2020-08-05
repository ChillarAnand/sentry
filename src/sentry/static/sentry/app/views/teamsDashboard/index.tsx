import React from 'react';
import {RouteComponentProps} from 'react-router/lib/Router';
import {Location} from 'history';

import {openCreateTeamModal} from 'app/actionCreators/modal';
import Button from 'app/components/button';
import SentryDocumentTitle from 'app/components/sentryDocumentTitle';
import ListLink from 'app/components/links/listLink';
import NavTabs from 'app/components/navTabs';
import LoadingIndicator from 'app/components/loadingIndicator';
import PageHeading from 'app/components/pageHeading';
import {IconGroup} from 'app/icons';
import {t} from 'app/locale';
import {PageContent, PageHeader} from 'app/styles/organization';
import {Organization, Team} from 'app/types';
import withOrganization from 'app/utils/withOrganization';
import recreateRoute from 'app/utils/recreateRoute';
import withTeams from 'app/utils/withTeams';
import Breadcrumbs from 'app/components/breadcrumbs';

import TabListTeam from './tabListTeam';
import {TAB} from './utils';

type Props = RouteComponentProps<
  {orgId: string; projectId: string; location: Location},
  {}
> & {
  organization: Organization;
  location: Location;
  params: Record<string, string | undefined>;
  teams: Array<Team>;
  isLoading: boolean;
};

type State = {
  currentTab: TAB;
};

class TeamsTabDashboard extends React.Component<Props, State> {
  state: State = {
    currentTab: TAB.DASHBOARD,
  };

  componentDidMount() {
    this.getCurrentTab();
  }

  getCurrentTab() {
    const {location} = this.props;

    const pathname = location.pathname;

    if (pathname.endsWith('all-teams/')) {
      this.setState({currentTab: TAB.ALL_TEAMS});
      return;
    }

    if (pathname.endsWith('my-teams/')) {
      this.setState({currentTab: TAB.MY_TEAMS});
      return;
    }

    this.setState({currentTab: TAB.DASHBOARD});
  }

  getCrumbs() {
    const {currentTab} = this.state;
    const {organization} = this.props;
    const orgSlug = organization.slug;
    const crumbs = [
      {
        to: `/organizations/${orgSlug}`,
        label: orgSlug,
        preserveGlobalSelection: true,
      },
    ];

    if (currentTab === TAB.ALL_TEAMS) {
      return [...crumbs, {label: t('All Teams')}];
    }

    return [...crumbs, {label: t('My Teams')}];
  }

  handleCreateTeam = () => {
    const {organization} = this.props;
    openCreateTeamModal({organization});
  };

  renderHeader() {
    const {organization, location, params, routes} = this.props;
    const {currentTab} = this.state;

    const hasTeamAdminAccess = organization.access.includes('project:admin');
    const baseUrl = recreateRoute('', {location, routes, params, stepBack: -2});
    const createTeamLabel = t('Create Team');

    return (
      <React.Fragment>
        <PageHeader>
          <Breadcrumbs crumbs={this.getCrumbs()} />
          <Button
            disabled={!hasTeamAdminAccess}
            title={
              !hasTeamAdminAccess
                ? t('You do not have permission to create teams')
                : undefined
            }
            onClick={this.handleCreateTeam}
            icon={<IconGroup />}
          >
            {createTeamLabel}
          </Button>
        </PageHeader>
        <NavTabs>
          <ListLink
            to={`${baseUrl}all-teams/`}
            isActive={() => currentTab === TAB.ALL_TEAMS}
            onClick={() => this.setState({currentTab: TAB.ALL_TEAMS})}
          >
            {t('All Teams')}
          </ListLink>
          <ListLink
            to={`${baseUrl}my-teams/`}
            isActive={() => currentTab === TAB.MY_TEAMS}
            onClick={() => this.setState({currentTab: TAB.MY_TEAMS})}
          >
            {t('My Teams')}
          </ListLink>
        </NavTabs>
      </React.Fragment>
    );
  }

  renderContent() {
    const {currentTab} = this.state;
    const {teams, organization, location} = this.props;

    switch (currentTab) {
      case TAB.ALL_TEAMS:
        return (
          <TabListTeam
            handleCreateTeam={this.handleCreateTeam}
            teams={teams}
            organization={organization}
            location={location}
          />
        );
      case TAB.MY_TEAMS:
        return (
          <TabListTeam
            handleCreateTeam={this.handleCreateTeam}
            teams={teams.filter(team => team.isMember)}
            organization={organization}
            location={location}
          />
        );
      default:
        return <div>This should not happen</div>;
    }
  }

  render() {
    const {organization, isLoading} = this.props;

    return (
      <React.Fragment>
        <SentryDocumentTitle title={t('Teams')} objSlug={organization.slug} />
        <PageContent>
          {this.renderHeader()}
          {isLoading ? <LoadingIndicator /> : this.renderContent()}
        </PageContent>
      </React.Fragment>
    );
  }
}

export default withOrganization(withTeams(TeamsTabDashboard));
