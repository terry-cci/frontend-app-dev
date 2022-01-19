class TodoItem {
  constructor(name, color) {
    this.name = name;
    this.color = color;
    this.done = false;
  }
}

const DEFAULT_COLOR = "#0070e8";

const { createApp, ref, reactive, computed, watch } = Vue;

createApp({
  setup() {
    const todoList = ref([new TodoItem("Finish homework", "#008000")]);
    watch(
      todoList,
      (v) => {
        localStorage.setItem("todoListItems", JSON.stringify(todoList.value));
      },
      { deep: true }
    );

    const savedTodoList = localStorage.getItem("todoListItems");
    if (savedTodoList) {
      todoList.value = JSON.parse(savedTodoList);
    }

    const doneTodo = computed(() => todoList.value.filter(({ done }) => done));

    const newTodoForm = reactive({
      name: "",
      color: DEFAULT_COLOR
    });

    const addTodo = ({ name, color }) => {
      todoList.value.push(new TodoItem(name, color));
    };

    const deleteTodo = (idx) => {
      todoList.value.splice(idx, 1);
    };

    const editingTodoIdx = ref(null);
    const editTodo = (idx) => {
      editingTodoIdx.value = idx;
      newTodoForm.name = todoList.value[idx].name;
      newTodoForm.color = todoList.value[idx].color;
    };

    const saveNewTodo = () => {
      if (editingTodoIdx.value !== null) {
        Object.assign(todoList.value[editingTodoIdx.value], newTodoForm);
        editingTodoIdx.value = null;
      } else {
        if (!newTodoForm.name.length) return;
        addTodo(newTodoForm);
      }

      newTodoForm.name = "";
      newTodoForm.color = DEFAULT_COLOR;
    };

    return {
      todoList,
      newTodoForm,
      addTodo,
      saveNewTodo,
      deleteTodo,
      editingTodoIdx,
      editTodo,
      doneTodo
    };
  }
}).mount("#app");
