import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from tkcalendar import DateEntry
from controllers import TaskTickController

class TaskTickApp:
    def __init__(self, root):
        self.root = root
        self.controller = TaskTickController(self)
        self.root.title("TaskTick")

        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(pady=10, expand=True)

        self._create_cadastro_aba()
        self._create_horas_aba()

        # Menu para selecionar o banco de dados
        menu = tk.Menu(self.root)
        self.root.config(menu=menu)

        arquivo_menu = tk.Menu(menu, tearoff=0)
        menu.add_cascade(label="Arquivo", menu=arquivo_menu)
        arquivo_menu.add_command(label="Selecionar Banco de Dados", command=self.controller.selecionar_bd)

        self.notebook.bind("<<NotebookTabChanged>>", self._on_tab_changed)

    def _create_cadastro_aba(self):
        self.aba_cadastro = ttk.Frame(self.notebook)
        self.notebook.add(self.aba_cadastro, text="Cadastrar Atividade")

        ttk.Label(self.aba_cadastro, text="Nome do Projeto:").grid(row=0, column=0, padx=10, pady=5)
        self.projeto_entry = ttk.Entry(self.aba_cadastro)
        self.projeto_entry.grid(row=0, column=1, padx=10, pady=5)

        ttk.Label(self.aba_cadastro, text="Descrição:").grid(row=1, column=0, padx=10, pady=5)
        self.descricao_entry = ttk.Entry(self.aba_cadastro)
        self.descricao_entry.grid(row=1, column=1, padx=10, pady=5)

        ttk.Label(self.aba_cadastro, text="Cliente:").grid(row=2, column=0, padx=10, pady=5)
        self.cliente_entry = ttk.Entry(self.aba_cadastro)
        self.cliente_entry.grid(row=2, column=1, padx=10, pady=5)

        ttk.Button(self.aba_cadastro, text="Cadastrar", command=self.controller.cadastrar_atividade).grid(row=3, column=0, columnspan=2, pady=10)

    def _create_horas_aba(self):
        self.aba_horas = ttk.Frame(self.notebook)
        self.notebook.add(self.aba_horas, text="Registrar Horas")

        ttk.Label(self.aba_horas, text="Atividade:").grid(row=0, column=0, padx=10, pady=5)
        self.atividade_combobox = ttk.Combobox(self.aba_horas)
        self.atividade_combobox.grid(row=0, column=1, padx=10, pady=5)

        ttk.Label(self.aba_horas, text="Data:").grid(row=1, column=0, padx=10, pady=5)
        self.data_entry = DateEntry(self.aba_horas)
        self.data_entry.grid(row=1, column=1, padx=10, pady=5)

        ttk.Label(self.aba_horas, text="Hora Início:").grid(row=2, column=0, padx=10, pady=5)
        self.hora_inicio_entry = ttk.Entry(self.aba_horas)
        self.hora_inicio_entry.grid(row=2, column=1, padx=10, pady=5)

        ttk.Label(self.aba_horas, text="Hora Fim:").grid(row=3, column=0, padx=10, pady=5)
        self.hora_fim_entry = ttk.Entry(self.aba_horas)
        self.hora_fim_entry.grid(row=3, column=1, padx=10, pady=5)

        ttk.Button(self.aba_horas, text="Registrar", command=self.controller.registrar_horas).grid(row=4, column=0, columnspan=2, pady=10)

    def limpar_campos_atividade(self):
        self.projeto_entry.delete(0, tk.END)
        self.descricao_entry.delete(0, tk.END)
        self.cliente_entry.delete(0, tk.END)

    def atualizar_atividades(self, atividades):
        self.atividade_combobox['values'] = atividades

    def _on_tab_changed(self, event):
        if self.notebook.index("current") == 1:  # Aba de registro de horas
            self.controller.carregar_atividades()

if __name__ == "__main__":
    root = tk.Tk()
    app = TaskTickApp(root)
    root.mainloop()

from tkcalendar import DateEntry
from tkinter import Toplevel

# Dentro da classe TaskTickApp

def _create_horas_aba(self):
    self.aba_horas = ttk.Frame(self.notebook)
    self.notebook.add(self.aba_horas, text="Registrar Horas")

    ttk.Label(self.aba_horas, text="Atividade:").grid(row=0, column=0, padx=10, pady=5)
    self.atividade_combobox = ttk.Combobox(self.aba_horas)
    self.atividade_combobox.grid(row=0, column=1, padx=10, pady=5)

    ttk.Label(self.aba_horas, text="Data:").grid(row=1, column=0, padx=10, pady=5)
    self.data_entry = DateEntry(self.aba_horas)
    self.data_entry.grid(row=1, column=1, padx=10, pady=5)

    self._add_time_selector(self.aba_horas, "Hora Início:", 2)
    self._add_time_selector(self.aba_horas, "Hora Fim:", 3)

    ttk.Button(self.aba_horas, text="Registrar", command=self.controller.registrar_horas).grid(row=4, column=0, columnspan=2, pady=10)

def _add_time_selector(self, parent, label_text, row):
    ttk.Label(parent, text=label_text).grid(row=row, column=0, padx=10, pady=5)
    time_entry = ttk.Entry(parent)
    time_entry.grid(row=row, column=1, padx=10, pady=5)
    time_button = ttk.Button(parent, text="Selecionar Hora", command=lambda: self._show_time_selector(time_entry))
    time_button.grid(row=row, column=2, padx=5, pady=5)

def _show_time_selector(self, entry):
    def set_time(hour, minute):
        entry.delete(0, tk.END)
        entry.insert(0, f"{hour:02d}:{minute:02d}")
        time_selector.destroy()

    time_selector = Toplevel(self.root)
    time_selector.title("Selecionar Hora")

    hours = [f"{h:02d}" for h in range(24)]
    minutes = [f"{m:02d}" for m in range(0, 60, 5)]

    hour_var = tk.StringVar(value=hours[0])
    minute_var = tk.StringVar(value=minutes[0])

    ttk.Label(time_selector, text="Hora:").grid(row=0, column=0, padx=10, pady=5)
    hour_combobox = ttk.Combobox(time_selector, textvariable=hour_var, values=hours)
    hour_combobox.grid(row=0, column=1, padx=10, pady=5)

    ttk.Label(time_selector, text="Minuto:").grid(row=1, column=0, padx=10, pady=5)
    minute_combobox = ttk.Combobox(time_selector, textvariable=minute_var, values=minutes)
    minute_combobox.grid(row=1, column=1, padx=10, pady=5)

    ttk.Button(time_selector, text="OK", command=lambda: set_time(int(hour_var.get()), int(minute_var.get()))).grid(row=2, column=0, columnspan=2, pady=10)
