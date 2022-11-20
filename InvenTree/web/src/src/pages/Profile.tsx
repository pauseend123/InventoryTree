import { ActionIcon, Button, Container, Grid, Group, SimpleGrid, Skeleton, Tabs, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate, useParams } from "react-router-dom";
import { StylishText } from "../components/StylishText";
import { useStyles } from "../globalStyle";
import { useToggle } from "@mantine/hooks";
import { IconEdit, IconDeviceFloppy } from '@tabler/icons';
import { useQuery } from "@tanstack/react-query";
import { api, queryClient } from "../App";


export function Profile() {
    const navigate = useNavigate();
    const { tabValue } = useParams();

    return (<>
        <StylishText>Profile</StylishText>
        <Tabs orientation="vertical" value={tabValue} onTabChange={(value) => navigate(`/profile/${value}`)}>
            <Tabs.List>
                <Tabs.Tab value="user">User</Tabs.Tab>
                <Tabs.Tab value="settings">Settings</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="user"><UserPanel /></Tabs.Panel>
            <Tabs.Panel value="settings"><SettingsPanel /></Tabs.Panel>
        </Tabs>
    </>);
}

function UserPanel() {
    // view
    const { theme } = useStyles();
    const PRIMARY_COL_HEIGHT = 300;
    const SECONDARY_COL_HEIGHT = PRIMARY_COL_HEIGHT / 2 - theme.spacing.md / 2;

    // data
    function fetchData() {
        return api.get('user/me/').then((res) => res.data);
    }
    const { isLoading, data } = useQuery({ queryKey: ["user-me"], queryFn: fetchData });

    return <Container>
        <SimpleGrid cols={2} spacing="md">
            <Container w="100%">
                {isLoading ? <Skeleton height="100%" radius="md" /> : <UserInfo data={data} />}
            </Container>
            <Grid gutter="md">
                <Grid.Col>
                    <Skeleton height={SECONDARY_COL_HEIGHT} radius="md" />
                </Grid.Col>
                <Grid.Col span={6}>
                    <Skeleton height={SECONDARY_COL_HEIGHT} radius="md" />
                </Grid.Col>
                <Grid.Col span={6}>
                    <Skeleton height={SECONDARY_COL_HEIGHT} radius="md" />
                </Grid.Col>
            </Grid>
        </SimpleGrid>
    </Container>;
}

function UserInfo({ data }: { data: any }) {
    if (!data) return <Skeleton />;

    const form = useForm({ initialValues: data });
    const [editing, setEditing] = useToggle([false, true] as const);
    function SaveData(values: any) {
        api.put('user/me/', values).then((res) => {
            if (res.status === 200) { setEditing(); queryClient.invalidateQueries(['user-me']); }
        });
    }

    return (<form onSubmit={form.onSubmit((values) => SaveData(values))}>
        <Group>
            <Text>Userinfo</Text>
            <ActionIcon onClick={() => setEditing()}>{editing ? <IconDeviceFloppy />: <IconEdit /> }</ActionIcon>
        </Group>
        <Group>
            {editing ? <TextInput label="First name" placeholder="First name" {...form.getInputProps('first_name')} /> : <Text>First name: {form.values.first_name}</Text>}
            {editing ? <TextInput label="Last name" placeholder="Last name" {...form.getInputProps('last_name')} /> : <Text>Last name: {form.values.last_name}</Text>}
            {editing ? <TextInput label="Username" placeholder="Username" {...form.getInputProps('username')} /> : <Text>Username: {form.values.username}</Text>}
        </Group>
        {editing ? <Group position="right" mt="md"><Button type="submit">Submit</Button></Group> : null}
    </form>);
}

function SettingsPanel() {
    return <Container>
        <Text>Settings</Text>
    </Container>;
}
