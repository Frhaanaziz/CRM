<script lang="ts" setup>
const props = defineProps<{
    disabled?: boolean;
    placeholder?: string;
}>();

const model = defineModel({ type: String, required: true });

const emit = defineEmits(['update:modelValue']);

const editor = useEditor({
    content: model.value,
    onUpdate: (content) => emit('update:modelValue', content.editor.getHTML()),
    extensions: [
        TiptapStarterKit,
        TiptapUnderline,
        TiptapTextAlign,
        TiptapLink,
        TiptapPlaceholder.configure({ placeholder: props.placeholder }),
    ],
    editorProps: {
        attributes: {
            class: cn([
                'disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] m-2 hover:ring-1 hover:ring-gray-300 rounded',
                'prose max-w-none',
            ]),
        },
    },
});

onBeforeUnmount(() => {
    unref(editor)?.destroy();
});

function handleLink() {
    if (!editor.value) return;
    const url = window.prompt('URL');
    if (!url) return;
    editor.value
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url, rel: 'noopener noreferrer', target: '_blank', class: 'text-brand no-underline' })
        .run();
}
</script>
<template>
    <TiptapEditorContent :editor :disabled />
    <div v-if="editor" class="flex items-center gap-12 p-2">
        <div class="flex items-center gap-6">
            <UButton
                icon="i-heroicons-bold"
                square
                size="xs"
                color="black"
                variant="soft"
                :disabled="!editor.can().chain().focus().toggleBold().run()"
                :class="{ 'is-active': editor.isActive('bold') }"
                @click="editor.chain().focus().toggleBold().run()"
            />
            <UButton
                icon="i-heroicons-italic"
                square
                size="xs"
                color="black"
                variant="soft"
                :disabled="!editor.can().chain().focus().toggleItalic().run()"
                :class="{ 'is-active': editor.isActive('italic') }"
                @click="editor.chain().focus().toggleItalic().run()"
            />
            <UButton
                icon="i-heroicons-underline"
                square
                size="xs"
                color="black"
                variant="soft"
                :disabled="!editor.can().chain().focus().toggleUnderline().run()"
                :class="{ 'is-active': editor.isActive('underline') }"
                @click="editor.chain().focus().toggleUnderline().run()"
            />
        </div>

        <div class="flex items-center gap-6">
            <UButton
                icon="i-heroicons-bars-3-bottom-left"
                square
                size="xs"
                color="black"
                variant="soft"
                @click="editor.chain().focus().setTextAlign('left').run()"
            />
            <UButton
                icon="i-heroicons-bars-3-center-left"
                square
                size="xs"
                color="black"
                variant="soft"
                @click="editor.chain().focus().setTextAlign('center').run()"
            />
            <UButton
                icon="i-heroicons-numbered-list"
                square
                size="xs"
                color="black"
                variant="soft"
                :class="{ 'is-active': editor.isActive('orderedList') }"
                @click="editor.chain().focus().toggleOrderedList().run()"
            />
            <UButton
                icon="i-heroicons-list-bullet"
                square
                size="xs"
                color="black"
                variant="soft"
                :class="{ 'is-active': editor.isActive('bulletList') }"
                @click="editor.chain().focus().toggleBulletList().run()"
            />
        </div>

        <div class="flex items-center gap-6">
            <UButton icon="i-heroicons-link" square size="xs" color="black" variant="soft" @click="handleLink" />
        </div>
    </div>
</template>
