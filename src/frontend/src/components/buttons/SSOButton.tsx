import { Button } from '@mantine/core';
import {
  IconBrandAzure,
  IconBrandBitbucket,
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandFlickr,
  IconBrandGithub,
  IconBrandGitlab,
  IconBrandGoogle,
  IconBrandReddit,
  IconBrandTwitch,
  IconBrandTwitter,
  IconLogin
} from '@tabler/icons-react';

import { api } from '../../App';
import { ApiEndpoints } from '../../enums/ApiEndpoints';
import { apiUrl } from '../../states/ApiState';
import { Provider } from '../../states/states';

const brandIcons: { [key: string]: JSX.Element } = {
  google: <IconBrandGoogle />,
  github: <IconBrandGithub />,
  facebook: <IconBrandFacebook />,
  discord: <IconBrandDiscord />,
  twitter: <IconBrandTwitter />,
  bitbucket: <IconBrandBitbucket />,
  flickr: <IconBrandFlickr />,
  gitlab: <IconBrandGitlab />,
  reddit: <IconBrandReddit />,
  twitch: <IconBrandTwitch />,
  microsoft: <IconBrandAzure />
};

export function SsoButton({ provider }: { provider: Provider }) {
  function login() {
    // set preferred provider
    api
      .put(
        apiUrl(ApiEndpoints.ui_preference),
        { preferred_method: 'pui' },
        { headers: { Authorization: '' } }
      )
      .then(() => {
        // redirect to login
        window.location.href = provider.login;
      });
  }

  return (
    <Button
      leftSection={getBrandIcon(provider)}
      radius="xl"
      component="a"
      onClick={login}
    >
      {provider.display_name}{' '}
    </Button>
  );
}
function getBrandIcon(provider: Provider) {
  return brandIcons[provider.id] || <IconLogin />;
}
