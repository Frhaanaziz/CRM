<template>
    <div>
        <h1 class="px-7 pt-7 text-2xl font-semibold">Team management</h1>

        <section class="grid gap-3 p-7 sm:grid-cols-3">
            <div class="rounded-md border p-3">
                <h2 class="text-xl font-semibold">Admin</h2>
                <p class="text-weak">All permissions enabled</p>
            </div>
            <div class="rounded-md border p-3">
                <h2 class="text-xl font-semibold">Manager</h2>
                <p class="text-weak">Have access to assign leads to sales</p>
            </div>
            <div class="rounded-md border p-3">
                <h2 class="text-xl font-semibold">Sales</h2>
                <p class="text-weak">Limited access to update leads</p>
            </div>
        </section>

        <section class="p-7">
            <TableTeamManagement />
        </section>
    </div>
</template>
