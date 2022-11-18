import { useToggle, upperFirst } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  Button,
  Divider,
  Checkbox,
  Anchor,
  Stack,
  Center,
  Chip,
} from '@mantine/core';
import { useState } from 'react';

export function AuthenticationForm({ handleLogin, navigate }: { handleLogin: any, navigate: any }) {
  const [action, toggleAction] = useToggle(['login', 'register']);
  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      terms: false,
    },
    validate: {
      password: (val) => (val.length <= 5 ? 'Password should include at least 6 characters' : null),
    },
  });
  const submit = () => {
    if (action === 'login') {
      handleLogin({ form: form.values, type: action, navigate: navigate });
    }
  };

  const hostOptions = [
    "https://demo.inventree.org",
    "https://sample.app.invenhost.com",
    "http://locahost:8000",
  ];
  const [formHost, setFormHost] = useState(hostOptions[0]);

  return (<>
    <Center>
      <Chip.Group position="center" m="md" multiple={false} value={formHost} onChange={setFormHost}>
        {hostOptions.map((host) => (<Chip key={host} value={host}>{host}</Chip>))}
      </Chip.Group>
    </Center>
    <Paper radius="md" p="xl" withBorder>
      <Text size="lg" weight={500}>Welcome to Mantine, {action} with</Text>
      <Center><Group grow mb="md" mt="md"><Text>Placeholder</Text></Group></Center>
      <Divider label="Or continue with email" labelPosition="center" my="lg" />
      <form onSubmit={form.onSubmit(() => { submit() })}>
        <Stack>
          {action === 'register' && (
            <TextInput
              label="Name"
              placeholder="Your name"
              value={form.values.name}
              onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
            />
          )}

          <TextInput
            required
            label="Username"
            placeholder="hello@mantine.dev"
            value={form.values.email}
            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            error={form.errors.email && 'Invalid email'}
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            error={form.errors.password && 'Password should include at least 6 characters'}
          />

          {action === 'register' && (
            <Checkbox
              label="I accept terms and conditions"
              checked={form.values.terms}
              onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
            />
          )}
        </Stack>

        <Group position="apart" mt="xl">
          <Anchor component="button" type="button" color="dimmed" onClick={() => toggleAction()} size="xs">
            {action === 'register'
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </Anchor>
          <Button type="submit">{upperFirst(action)}</Button>
        </Group>
      </form>
    </Paper>
  </>);
}
