export default defineEventHandler(async (event) => {
    const id = event.context.params!.id;

    const fetchApi = await backendApi(event);
    await fetchApi(`/companies/${id}`, {
        method: 'DELETE',
    });
});
