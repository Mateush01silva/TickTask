from tkinter import filedialog, messagebox
from models import TaskTickModel
from datetime import datetime, timedelta

class TaskTickController:
    def __init__(self, view):
        self.view = view
        self.model = None

    def selecionar_bd(self):
        db_path = filedialog.askopenfilename(filetypes=[("Excel files", "*.xlsx")])
        if db_path:
            self.model = TaskTickModel(db_path)
            self.carregar_atividades()
            messagebox.showinfo("Sucesso", "Banco de dados carregado com sucesso.")
    def carregar_atividades(self):
        if self.model:
            atividades = self.model.carregar_atividades()
            self.view.atualizar_atividades(atividades) #PONTO A OBSERVAR, NÃO ESTÁ ENTENDENDO COMO UMA FUNÇÃO (atualizar_atividades)

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
            self.model.cadastrar_atividade(projeto, descricao, cliente) #adastrar_atividade(projeto, descricao, cliente)
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
            self.view.limpar_campos_horas()
        except PermissionError as e:
            messagebox.showerror("Erro", str(e))

    def calcular_horas_trabalhadas(self, atividade):
        if not self.model:
            return "Selecione um banco de dados primeiro."

        try:
            df = self.model.carregar_atividades()
            filtro = df[df['Atividade'] == atividade]
            horas_trabalhadas = filtro['Horas Trabalhadas'].sum()
            return f"{horas_trabalhadas} horas"
        except Exception as e:
            return f"Erro ao calcular horas trabalhadas: {str(e)}"

    def calcular_dias_corridos(self):
        if not self.model:
            return "Selecione um banco de dados primeiro."

        try:
            df = self.model.carregar_atividades()
            dias_corridos = len(df['Data'].unique())
            return str(dias_corridos)
        except Exception as e:
            return f"Erro ao calcular dias corridos: {str(e)}"

    def calcular_dias_trabalhados(self):
        if not self.model:
            return "Selecione um banco de dados primeiro."

        try:
            df = self.model.carregar_atividades()
            dias_trabalhados = df.shape[0]  # Assumindo que cada linha é um registro de atividade
            return str(dias_trabalhados)
        except Exception as e:
            return f"Erro ao calcular dias trabalhados: {str(e)}"

    def calcular_media_horas_dia(self):
        if not self.model:
            return "Selecione um banco de dados primeiro."

        try:
            df = self.model.carregar_atividades()
            total_horas = df['Horas Trabalhadas'].sum()
            dias_corridos = len(df['Data'].unique())
            if dias_corridos > 0:
                media_horas_dia = total_horas / dias_corridos
                return f"{media_horas_dia:.2f} horas por dia"
            else:
                return "Nenhum dia registrado ainda"
        except Exception as e:
            return f"Erro ao calcular média horas/dia: {str(e)}"

    def calcular_maximo_horas_dia(self):
        if not self.model:
            return "Selecione um banco de dados primeiro."

        try:
            df = self.model.carregar_atividades()
            maximo_horas_dia = df['Horas Trabalhadas'].max()
            return f"{maximo_horas_dia} horas"
        except Exception as e:
            return f"Erro ao calcular máximo horas/dia: {str(e)}"

    def calcular_minimo_horas_dia(self):
        if not self.model:
            return "Selecione um banco de dados primeiro."

        try:
            df = self.model.carregar_atividades()
            minimo_horas_dia = df['Horas Trabalhadas'].min()
            return f"{minimo_horas_dia} horas"
        except Exception as e:
            return f"Erro ao calcular mínimo horas/dia: {str(e)}"

