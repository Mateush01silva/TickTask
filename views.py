import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from tkcalendar import DateEntry
from controllers import TaskTickController
from tkinter import Toplevel

class TaskTickApp:
    def __init__(self, root):
        self.root = root
        self.controller = TaskTickController(self)
        self.root.title("TaskTick")
        
        self.resumo_atividade_combobox = ttk.Combobox(values=self.controller.resumo_carregar_atividades())
        
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(pady=10, expand=True)

        self._create_cadastro_aba()
        self._create_horas_aba()

        # Menu para selecionar o banco de dados
        menu = tk.Menu(self.root)
        self.root.config(menu=menu)

        arquivo_menu = tk.Menu(menu, tearoff=0)
        menu.add_cascade(label="Arquivo", menu=arquivo_menu)
        arquivo_menu.add_command(label="Selecionar Banco de Dados Atividades", command=self.controller.selecionar_bd)

        # Submenu Resumo
        resumo = tk.Menu(menu, tearoff=0)
        menu.add_cascade(label="Resumo", menu=resumo)
        resumo.add_command(label="Abrir Resumo", command=self.abrir_resumo)

        self.notebook.bind("<<NotebookTabChanged>>", self._on_tab_changed)

    def abrir_resumo(self):
        # Implementação para abrir a nova página de resumo
        resumo_window = Toplevel(self.root)
        resumo_window.title("Resumo")

        ttk.Label(resumo_window, text="Selecione a Atividade:").grid(row=0, column=0, padx=10, pady=5)
        self.resumo_atividade_combobox = ttk.Combobox(resumo_window, values= self.controller.resumo_carregar_atividades())
        self.resumo_atividade_combobox.grid(row=0, column=1, padx=10, pady=5)

        ttk.Label(resumo_window, text="Horas Trabalhadas:").grid(row=1, column=0, padx=10, pady=5)
        horas_trabalhadas_label = ttk.Label(resumo_window, text="")
        horas_trabalhadas_label.grid(row=1, column=1, padx=10, pady=5)

        ttk.Label(resumo_window, text="Dias Corridos:").grid(row=2, column=0, padx=10, pady=5)
        dias_corridos_label = ttk.Label(resumo_window, text="")
        dias_corridos_label.grid(row=2, column=1, padx=10, pady=5)

        ttk.Label(resumo_window, text="Dias Trabalhados:").grid(row=3, column=0, padx=10, pady=5)
        dias_trabalhados_label = ttk.Label(resumo_window, text="")
        dias_trabalhados_label.grid(row=3, column=1, padx=10, pady=5)

        ttk.Label(resumo_window, text="Média Horas/dia:").grid(row=4, column=0, padx=10, pady=5)
        media_horas_dia_label = ttk.Label(resumo_window, text="")
        media_horas_dia_label.grid(row=4, column=1, padx=10, pady=5)

        ttk.Label(resumo_window, text="Máximo Horas/dia:").grid(row=5, column=0, padx=10, pady=5)
        maximo_horas_dia_label = ttk.Label(resumo_window, text="")
        maximo_horas_dia_label.grid(row=5, column=1, padx=10, pady=5)

        ttk.Label(resumo_window, text="Mínimo Horas/dia:").grid(row=6, column=0, padx=10, pady=5)
        minimo_horas_dia_label = ttk.Label(resumo_window, text="")
        minimo_horas_dia_label.grid(row=6, column=1, padx=10, pady=5)

    def atualizar_resumo(self):
            # Lógica para atualizar as informações do resumo
            atividade_selecionada = self.resumo_atividade_combobox.get()
            horas_trabalhadas = self.controller.calcular_horas_trabalhadas(atividade_selecionada)
            dias_corridos = self.controller.calcular_dias_corridos()
            dias_trabalhados = self.controller.calcular_dias_trabalhados()
            media_horas_dia = self.controller.calcular_media_horas_dia()
            maximo_horas_dia = self.controller.calcular_maximo_horas_dia()
            minimo_horas_dia = self.controller.calcular_minimo_horas_dia()

            self.horas_trabalhadas_label.config(text=horas_trabalhadas)
            self.dias_corridos_label.config(text=dias_corridos)
            self.dias_trabalhados_label.config(text=dias_trabalhados)
            self.media_horas_dia_label.config(text=media_horas_dia)
            self.maximo_horas_dia_label.config(text=maximo_horas_dia)
            self.minimo_horas_dia_label.config(text=minimo_horas_dia)

            ttk.Button(self.resumo_window, text="Atualizar", command=self.atualizar_resumo).grid(row=7, column=0, columnspan=2, pady=10)

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

        # Adicionar o seletor de hora de início e hora de fim
        self.hora_inicio_entry = self._add_time_selector(self.aba_horas, "Hora Início:", 2)
        self.hora_fim_entry = self._add_time_selector(self.aba_horas, "Hora Fim:", 3)

        ttk.Button(self.aba_horas, text="Registrar", command=self.controller.registrar_horas).grid(row=4, column=0, columnspan=2, pady=10)

    def _add_time_selector(self, parent, label_text, row):
        ttk.Label(parent, text=label_text).grid(row=row, column=0, padx=10, pady=5)
        time_entry = ttk.Entry(parent)
        time_entry.grid(row=row, column=1, padx=10, pady=5)
        ttk.Button(parent, text="Selecionar", command=lambda: self._show_time_selector(time_entry)).grid(row=row, column=2, padx=10, pady=5)
        return time_entry

    def _show_time_selector(self, entry):
        def set_time(hour, minute):
            entry.delete(0, tk.END)
            entry.insert(0, f"{hour:02d}:{minute:02d}")
            time_selector.destroy()

        time_selector = Toplevel(self.root)
        time_selector.title("Selecionar Hora")

        hours = [f"{i:02d}" for i in range(24)]
        minutes = [f"{i:02d}" for i in range(60)]

        hour_var = tk.StringVar(time_selector)
        hour_var.set(hours[0])
        hour_menu = tk.OptionMenu(time_selector, hour_var, *hours)
        hour_menu.pack(side=tk.LEFT, padx=5)

        minute_var = tk.StringVar(time_selector)
        minute_var.set(minutes[0])
        minute_menu = tk.OptionMenu(time_selector, minute_var, *minutes)
        minute_menu.pack(side=tk.LEFT, padx=5)

        ttk.Button(time_selector, text="OK", command=lambda: set_time(int(hour_var.get()), int(minute_var.get()))).pack(pady=5)

    def limpar_campos_atividade(self):
        self.projeto_entry.delete(0, tk.END)
        self.descricao_entry.delete(0, tk.END)
        self.cliente_entry.delete(0, tk.END)

    def limpar_campos_horas(self):
        self.atividade_combobox.delete(0, tk.END)
        self.data_entry.delete(0, tk.END)
        self.hora_inicio_entry.delete(0, tk.END)
        self.hora_fim_entry.delete(0, tk.END)

    def atualizar_atividades(self, atividades):
        self.atividade_combobox['values'] = atividades

    def _on_tab_changed(self, event):
        if self.notebook.index("current") == 1:  # Aba de registro de horas
            self.controller.carregar_atividades()

if __name__ == "__main__":
    root = tk.Tk()
    controller = TaskTickController(view=None)
    app = TaskTickApp(root)
    root.mainloop()