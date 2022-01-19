const { createApp, ref, reactive, computed, watch } = Vue;

class Page {
  constructor(title, content) {
    this.title = title;
    this.content = content;
  }
}

class PageGroup {
  constructor(...pages) {
    this.pages = [...pages];
  }

  get length() {
    return this.pages.length;
  }

  getPages() {
    return this.pages;
  }

  addPage(page) {
    this.pages.push(page);
  }
}

const defaultPageGroups = [
  new PageGroup(
    new Page("Page 0", "Page 0's content"),
    new Page("Page 0.1", "Page 0.1's content")
  ),
  new PageGroup(new Page("Page1", "Page1"))
];

createApp({
  setup() {
    const pageGroups = ref(defaultPageGroups);
    const activePageIdx = reactive({
      group: 0,
      idx: 0
    });
    const activePageKey = computed(
      () => `${activePageIdx.group}.${activePageIdx.idx}`
    );
    const activePageGroup = computed(
      () => pageGroups.value[activePageIdx.group]
    );
    const activePage = computed(
      () => activePageGroup.value.getPages()[activePageIdx.idx]
    );

    const moveToPageInGroup = (x) => {
      swipeDirection.value = x < activePageIdx.idx ? "down" : "up";
      activePageIdx.idx = x;
    };

    const moveToPageGroup = (x) => {
      moveToPageInGroup(0);
      swipeDirection.value = x < activePageIdx.group ? "right" : "left";
      activePageIdx.group = x;
    };

    const addPageInGroup = (x) => {
      const group = pageGroups.value[x];
      group.addPage(
        new Page(
          `Page ${x}.${group.length}`,
          `Page ${x}.${group.length}'s content`
        )
      );
    };
    const addPageInActiveGroup = () => {
      addPageInGroup(activePageIdx.group);
      moveToPageInGroup(activePageGroup.value.length - 1);
    };
    const addPageGroup = () => {
      pageGroups.value.push(new PageGroup());
      addPageInGroup(pageGroups.value.length - 1);
      moveToPageGroup(pageGroups.value.length - 1);
    };

    const editing = ref(true);
    const setEditing = (x) => {
      editing.value = x;
    };

    const activePageClone = ref(new Page());
    const cloneActivePage = () => {
      activePageClone.value = new Page(
        activePage.value.title,
        activePage.value.content
      );
    };
    watch(activePageIdx, cloneActivePage);
    cloneActivePage();

    const resetEditForm = () => {
      cloneActivePage();
    };
    const saveEditForm = () => {
      Object.assign(activePage.value, activePageClone.value);
    };
    // const isCloneDirty = computed(() => activePageClone)

    const swipeDirection = ref("");

    return {
      pageGroups,
      activePageIdx,
      activePageGroup,
      activePage,
      moveToPageGroup,
      moveToPageInGroup,
      editing,
      setEditing,
      addPageInActiveGroup,
      addPageGroup,
      activePageClone,
      resetEditForm,
      saveEditForm,
      activePageKey,
      swipeDirection
    };
  }
}).mount("#app");
