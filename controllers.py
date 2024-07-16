from tkinter import filedialog, messagebox
from models import TaskTickModel

class TaskTickController:
    def __init__(self, view):
        self.view = view
        self.model = None

    def selecionar_bd(self):
        db_path = filedialog.askopenfilename(filetypes=[("Excel files", "*.xlsx")])
        if db_path:
            self.model = TaskTickModel(db_path)
            self.carregar_atividades()

    def carregar_atividades(self):
        if self.model:
            atividades = self.model.carregar_atividades()
            self.view.atualizar_atividades(atividades)

    def cadastrar_atividade(self):
        if not self.model:
            messagebox.showerror("Erro", "Selecione um banco de dados primeiro.")
            return
        
        projeto = self.view.projeto_entry.get()
        descricao = self.view.descricao_entry.get()
        cliente = self.view.cliente_entry.get()
        
        if not projeto or not descricao or not cliente:
            messagebox.showerror("Erro", "Preencha todos os campos.")
            return
        
        try:
            self.model.cadastrar_atividade(projeto, descricao, cliente)
            messagebox.showinfo("Sucesso", "Atividade cadastrada com sucesso.")
            self.view.limpar_campos_atividade()
            self.carregar_atividades()
        except PermissionError as e:
            messagebox.showerror("Erro", str(e))

    def registrar_horas(self):
        if not self.model:
            messagebox.showerror("Erro", "Selecione um banco de dados primeiro.")
            return
        
        atividade = self.view.atividade_combobox.get()
        data = self.view.data_entry.get()
        hora_inicio = self.view.hora_inicio_entry.get()
        hora_fim = self.view.hora_fim_entry.get()
        
        if not atividade or not data or not hora_inicio or not hora_fim:
            messagebox.showerror("Erro", "Preencha todos os campos.")
            return
        
        try:
            self.model.registrar_horas(atividade, data, hora_inicio, hora_fim)
            messagebox.showinfo("Sucesso", "Horas registradas com sucesso.")
        except PermissionError as e:
            messagebox.showerror("Erro", str(e))
