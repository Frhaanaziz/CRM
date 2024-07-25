export default defineEventHandler(async (event) => {
    const id = event.context.params!.id;

    const fetchApi = await backendApi(event);
    const { data } = await fetchApi<{ data: any }>(`/b2b-companies/${id}`);

    return data;
});
