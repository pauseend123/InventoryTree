import { t } from '@lingui/macro';
import {
  Alert,
  DefaultMantineColor,
  Divider,
  LoadingOverlay,
  Text
} from '@mantine/core';
import { Button, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo } from 'react';
import { useState } from 'react';

import { api, queryClient } from '../../App';
import {
  constructFormUrl,
  extractAvailableFields
} from '../../functions/forms';
import { invalidResponse } from '../../functions/notifications';
import { ApiPaths } from '../../states/ApiState';
import {
  ApiFormField,
  ApiFormFieldSet,
  ApiFormFieldType
} from './fields/ApiFormField';

interface ApiFormAction {
  text: string | React.ReactElement;
  color: DefaultMantineColor;
  variant?: 'outline';
  onClick: () => void;
}

/**
 * Properties for the ApiForm component
 * @param url : The API endpoint to fetch the form data from
 * @param pk : Optional primary-key value when editing an existing object
 * @param method : Optional HTTP method to use when submitting the form (default: GET)
 * @param title : The title to display in the form header
 * @param fields : The fields to render in the form
 * @param submitText : Optional custom text to display on the submit button (default: Submit)4
 * @param submitColor : Optional custom color for the submit button (default: green)
 * @param cancelText : Optional custom text to display on the cancel button (default: Cancel)
 * @param cancelColor : Optional custom color for the cancel button (default: blue)
 * @param fetchInitialData : Optional flag to fetch initial data from the server (default: true)
 * @param preFormContent : Optional content to render before the form fields
 * @param postFormContent : Optional content to render after the form fields
 * @param successMessage : Optional message to display on successful form submission
 * @param onFormSuccess : A callback function to call when the form is submitted successfully.
 * @param onFormError : A callback function to call when the form is submitted with errors.
 */
export interface ApiFormProps {
  url: ApiPaths;
  pk?: number | string | undefined;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  fields?: ApiFormFieldSet;
  submitText?: string;
  submitColor?: string;
  fetchInitialData?: boolean;
  ignorePermissionCheck?: boolean;
  preFormContent?: JSX.Element | (() => JSX.Element);
  postFormContent?: JSX.Element | (() => JSX.Element);
  successMessage?: string;
  onFormSuccess?: (data: any) => void;
  onFormError?: () => void;
  actions?: ApiFormAction[];
}

export function OptionsApiForm({
  props: _props,
  id: pId
}: {
  props: ApiFormProps;
  id?: string;
}) {
  const props = useMemo(
    () => ({
      ..._props,
      method: _props.method || 'GET'
    }),
    [_props]
  );

  const id = useId(pId);

  const url = useMemo(
    () => constructFormUrl(props.url, props.pk),
    [props.url, props.pk]
  );

  const { data } = useQuery({
    enabled: true,
    queryKey: ['form-options-data', id, props.method, props.url, props.pk],
    queryFn: () =>
      api.options(url).then((res) => {
        let fields: Record<string, ApiFormFieldType> | null = {};

        if (!props.ignorePermissionCheck) {
          fields = extractAvailableFields(res, props.method);
        }
        console.log('OPTIONS FETCHED');
        // TODO: figure out how that case should be handled
        // if (fields === null) {
        // return;
        // }

        return fields;
      }),
    throwOnError: (error: any, query) => {
      console.log('Error:', error);
      if (error.response) {
        invalidResponse(error.response.status);
      } else {
        notifications.show({
          title: t`Form Error`,
          message: error.message,
          color: 'red'
        });
      }

      return false;
    }
  });

  if (!data) {
    return <LoadingOverlay visible={true} />;
  }

  return <ApiForm id={id} props={props} fieldDefinitions={data} />;
}

/**
 * An ApiForm component is a modal form which is rendered dynamically,
 * based on an API endpoint.
 */
export function ApiForm({
  id,
  props,
  fieldDefinitions
}: {
  id: string;
  props: ApiFormProps;
  fieldDefinitions: ApiFormFieldSet;
}) {
  // Form errors which are not associated with a specific field
  const [nonFieldErrors, setNonFieldErrors] = useState<string[]>([]);

  // Form state
  const form = useForm({});

  // Cache URL
  const url = useMemo(
    () => constructFormUrl(props.url, props.pk),
    [props.url, props.pk]
  );

  // Render pre-form content
  // TODO: Future work will allow this content to be updated dynamically based on the form data
  const preFormElement: JSX.Element | null = useMemo(() => {
    if (props.preFormContent === undefined) {
      return null;
    } else if (props.preFormContent instanceof Function) {
      return props.preFormContent();
    } else {
      return props.preFormContent;
    }
  }, [props.preFormContent]);

  // Render post-form content
  // TODO: Future work will allow this content to be updated dynamically based on the form data
  const postFormElement: JSX.Element | null = useMemo(() => {
    if (props.postFormContent === undefined) {
      return null;
    } else if (props.postFormContent instanceof Function) {
      return props.postFormContent();
    } else {
      return props.postFormContent;
    }
  }, [props.postFormContent]);

  // Query manager for retrieving initial data from the server
  const initialDataQuery = useQuery({
    enabled: false,
    queryKey: ['form-initial-data', id, props.method, props.url, props.pk],
    queryFn: async () => {
      return api
        .get(url)
        .then((response) => {
          // Update form values, but only for the fields specified for the form
          Object.keys(props.fields ?? {}).forEach((fieldName) => {
            if (fieldName in response.data) {
              form.setValues({
                [fieldName]: response.data[fieldName]
              });
            }
          });

          return response;
        })
        .catch((error) => {
          console.error('Error fetching initial data:', error);
        });
    }
  });

  // Fetch initial data on form load
  useEffect(() => {
    // Provide initial form data
    Object.entries(props.fields ?? {}).forEach(([fieldName, field]) => {
      // fieldDefinition is supplied by the API, and can serve as a backup
      let fieldDefinition = fieldDefinitions[fieldName] ?? {};

      let v =
        field.value ??
        field.default ??
        fieldDefinition.value ??
        fieldDefinition.default ??
        undefined;

      if (v !== undefined) {
        form.setValues({
          [fieldName]: v
        });
      }
    });

    // Fetch initial data if the fetchInitialData property is set
    if (props.fetchInitialData) {
      queryClient.removeQueries({
        queryKey: ['form-initial-data', id, props.method, props.url, props.pk]
      });
      initialDataQuery.refetch();
    }
  }, []);

  // Query manager for submitting data
  const submitQuery = useQuery({
    enabled: false,
    queryKey: ['form-submit', id, props.method, props.url, props.pk],
    queryFn: async () => {
      let method = props.method?.toLowerCase() ?? 'get';

      return api({
        method: method,
        url: url,
        data: form.values,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then((response) => {
          switch (response.status) {
            case 200:
            case 201:
            case 204:
              // Form was submitted successfully

              // Optionally call the onFormSuccess callback
              if (props.onFormSuccess) {
                props.onFormSuccess(response.data);
              }

              // Optionally show a success message
              if (props.successMessage) {
                notifications.show({
                  title: t`Success`,
                  message: props.successMessage,
                  color: 'green'
                });
              }

              break;
            default:
              // Unexpected state on form success
              invalidResponse(response.status);
              props.onFormError?.();
              break;
          }

          return response;
        })
        .catch((error) => {
          if (error.response) {
            switch (error.response.status) {
              case 400:
                // Data validation error
                form.setErrors(error.response.data);
                setNonFieldErrors(error.response.data.non_field_errors ?? []);
                setIsLoading(false);
                break;
              default:
                // Unexpected state on form error
                invalidResponse(error.response.status);
                props.onFormError?.();
                break;
            }
          } else {
            invalidResponse(0);
            props.onFormError?.();
          }

          return error;
        });
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  // Data loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(submitQuery.isFetching || initialDataQuery.isFetching);
  }, [initialDataQuery.status, submitQuery.status]);

  /**
   * Callback to perform form submission
   */
  function submitForm() {
    setIsLoading(true);
    submitQuery.refetch();
  }

  return (
    <Stack>
      <Divider />
      <Stack spacing="sm">
        <LoadingOverlay visible={isLoading} />
        {(Object.keys(form.errors).length > 0 || nonFieldErrors.length > 0) && (
          <Alert radius="sm" color="red" title={t`Form Errors Exist`}>
            {nonFieldErrors.length > 0 && (
              <Stack spacing="xs">
                {nonFieldErrors.map((message) => (
                  <Text key={message}>{message}</Text>
                ))}
              </Stack>
            )}
          </Alert>
        )}
        {preFormElement}
        <Stack spacing="xs">
          {Object.entries(props.fields ?? {}).map(
            ([fieldName, field]) =>
              !field.hidden && (
                <ApiFormField
                  key={fieldName}
                  field={field}
                  fieldName={fieldName}
                  formProps={props}
                  form={form}
                  error={form.errors[fieldName] ?? null}
                  definitions={fieldDefinitions}
                />
              )
          )}
        </Stack>
        {postFormElement}
      </Stack>
      <Divider />
      <Group position="right">
        {props.actions?.map((action, i) => (
          <Button
            key={i}
            onClick={action.onClick}
            variant={action.variant ?? 'outline'}
            radius="sm"
            color={action.color}
          >
            {action.text}
          </Button>
        ))}
        <Button
          onClick={submitForm}
          variant="outline"
          radius="sm"
          color={props.submitColor ?? 'green'}
          disabled={isLoading}
        >
          {props.submitText ?? t`Submit`}
        </Button>
      </Group>
    </Stack>
  );
}
