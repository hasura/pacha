export type FormHandlers<T> = {
  onSubmit?: (values: T) => void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export type FormStyle = {
  noShadow?: boolean;
  noPadding?: boolean;
};

export type FormComponentProps<
  FormSchema,
  ComponentProps = Record<string, unknown>,
> = FormHandlers<FormSchema> &
  FormStyle & { initialValues: FormSchema } & ComponentProps;
