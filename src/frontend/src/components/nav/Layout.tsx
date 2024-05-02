import { t } from '@lingui/macro';
import { Container, Flex, Space } from '@mantine/core';
import { Spotlight, createSpotlight } from '@mantine/spotlight';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { getActions } from '../../defaults/actions';
import { isLoggedIn } from '../../functions/auth';
import * as classes from '../../main.css';
import { Footer } from './Footer';
import { Header } from './Header';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();

  if (!isLoggedIn()) {
    return (
      <Navigate to="/logged-in" state={{ redirectFrom: location.pathname }} />
    );
  }

  return children;
};

export const [firstStore, firstSpotlight] = createSpotlight();

export default function LayoutComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultactions = getActions(navigate);
  const [actions, setActions] = useState(defaultactions);
  const [customActions, setCustomActions] = useState<boolean>(false);

  function actionsAreChanging(change: any) {
    if (change.registeredActions.length > defaultactions.length)
      setCustomActions(true);
    setActions(change);
  }
  // firstStore.subscribe(actionsAreChanging);

  // clear additional actions on location change
  useEffect(() => {
    if (customActions) {
      setActions(defaultactions);
      setCustomActions(false);
    }
  }, [location]);

  return (
    <ProtectedRoute>
      <Flex direction="column" mih="100vh">
        <Header />
        <Container className={classes.layoutContent} size="100%">
          <Outlet />
        </Container>
        <Space h="xl" />
        <Footer />
        <Spotlight
          actions={actions}
          store={firstStore}
          highlightQuery
          searchProps={{
            leftSection: <IconSearch size="1.2rem" />,
            placeholder: t`Search...`
          }}
          shortcut={['mod + K', '/']}
          nothingFound={t`Nothing found...`}
        />
      </Flex>
    </ProtectedRoute>
  );
}
