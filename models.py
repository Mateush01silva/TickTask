import pandas as pd
import os
from openpyxl import load_workbook
import tkinter as tk
from tkinter import ttk, filedialog, messagebox

class TaskTickModel:
    def __init__(self, db_path):
        self.db_path = db_path

    def carregar_atividades(self):
        if not os.path.exists(self.db_path):
            return []
        df = pd.read_excel(self.db_path, sheet_name="Atividades")
        return df['Projeto'].tolist()
        
    def cadastrar_atividade(self, projeto, descricao, cliente):
            try:
                df = pd.read_excel(self.db_path, sheet_name='Atividades')

                proxima_linha = df.shape[0] + 1

                df.loc[proxima_linha, 'Projeto'] = projeto
                df.loc[proxima_linha, 'Descrição'] = descricao
                df.loc[proxima_linha, 'Cliente'] = cliente

                df.to_excel(self.db_path, index=False, sheet_name='Atividades')
            
            except PermissionError:
                raise PermissionError("O arquivo já está aberto. Por favor, feche o arquivo e tente novamente.")

    def registrar_horas(self, atividade, data, hora_inicio, hora_fim):
        novas_horas = pd.DataFrame([[atividade, data, hora_inicio, hora_fim]], columns=['Atividade', 'Data', 'Hora Início', 'Hora Fim'])
        try:
            if os.path.exists(self.db_path):
                with pd.ExcelWriter(self.db_path, engine='openpyxl', mode='a', if_sheet_exists='overlay') as writer:
                    book = load_workbook(self.db_path)
                    writer.book = book
                    writer.sheets = {ws.title: ws for ws in book.worksheets}
                    startrow = writer.sheets['Horas Trabalhadas'].max_row
                    novas_horas.to_excel(writer, sheet_name='Horas Trabalhadas', index=False, header=False, startrow=startrow)
            else:
                with pd.ExcelWriter(self.db_path, engine='openpyxl') as writer:
                    novas_horas.to_excel(writer, index=False, header=True, sheet_name='Horas Trabalhadas')
        except PermissionError:
            raise PermissionError("O arquivo já está aberto. Por favor, feche o arquivo e tente novamente.")
