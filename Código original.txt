import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import pandas as pd
import os
from datetime import datetime

# Função para selecionar o banco de dados em Excel
def select_db():
    global db_path
    db_path = filedialog.askopenfilename(
        title="Selecione o Banco de Dados",
        filetypes=[("Excel files", "*.xlsx")]
    )
    if db_path:
        messagebox.showinfo("Banco de Dados Selecionado", f"Banco de dados selecionado: {db_path}")
    else:
        messagebox.showwarning("Nenhum Arquivo Selecionado", "Nenhum arquivo foi selecionado!")

# Função para cadastrar atividade
def cadastrar_atividade():
    projeto = projeto_entry.get()
    descricao = descricao_entry.get()
    cliente = cliente_entry.get()
    if not db_path:
        messagebox.showwarning("Banco de Dados Não Selecionado", "Por favor, selecione um banco de dados primeiro.")
        return
    if projeto and descricao and cliente:
        data = pd.DataFrame([[projeto, descricao, cliente]], columns=["Projeto", "Descrição", "Cliente"])
        if os.path.exists(db_path):
            data.to_excel(db_path, index=False, header=False)
        else:
            data.to_excel(db_path, index=False)
        messagebox.showinfo("Sucesso", "Atividade cadastrada com sucesso!")
    else:
        messagebox.showwarning("Campos Vazios", "Por favor, preencha todos os campos.")

# Função para registrar horas trabalhadas
def registrar_horas():
    atividade = atividade_combobox.get()
    data = data_entry.get()
    hora_inicio = hora_inicio_entry.get()
    hora_fim = hora_fim_entry.get()
    if not db_path:
        messagebox.showwarning("Banco de Dados Não Selecionado", "Por favor, selecione um banco de dados primeiro.")
        return
    if atividade and data and hora_inicio and hora_fim:
        horas_data = pd.DataFrame([[atividade, data, hora_inicio, hora_fim]], columns=["Atividade", "Data", "Hora Início", "Hora Fim"])
        if os.path.exists(db_path):
            horas_data.to_excel(db_path, index=False, header=False, mode='a', sheet_name="Horas")
        else:
            horas_data.to_excel(db_path, index=False, sheet_name="Horas")
        messagebox.showinfo("Sucesso", "Horas registradas com sucesso!")
    else:
        messagebox.showwarning("Campos Vazios", "Por favor, preencha todos os campos.")

# Função para visualizar resumos
def visualizar_resumos():
    if not db_path:
        messagebox.showwarning("Banco de Dados Não Selecionado", "Por favor, selecione um banco de dados primeiro.")
        return
    try:
        horas_df = pd.read_excel(db_path, sheet_name="Horas")
        resumo_text.delete("1.0", tk.END)
        for projeto in horas_df['Atividade'].unique():
            projeto_df = horas_df[horas_df['Atividade'] == projeto]
            total_horas = 0
            dias_trabalhados = len(projeto_df['Data'].unique())
            for _, row in projeto_df.iterrows():
                inicio = datetime.strptime(row['Hora Início'], "%H:%M")
                fim = datetime.strptime(row['Hora Fim'], "%H:%M")
                total_horas += (fim - inicio).seconds / 3600
            resumo_text.insert(tk.END, f"Projeto: {projeto}\n")
            resumo_text.insert(tk.END, f"Dias Corridos Trabalhados: {len(projeto_df['Data'].unique())}\n")
            resumo_text.insert(tk.END, f"Dias Efetivos Trabalhados: {dias_trabalhados}\n")
            resumo_text.insert(tk.END, f"Total de Horas Trabalhadas: {total_horas:.2f}\n")
            resumo_text.insert(tk.END, f"---\n")
    except Exception as e:
        messagebox.showerror("Erro", f"Erro ao carregar os dados: {e}")

# Configuração da janela principal
root = tk.Tk()
root.title("TaskTick")
root.geometry("300x200")

# Aba de cadastro de atividade
aba_control = ttk.Notebook(root)
aba_cadastro = ttk.Frame(aba_control)
aba_control.add(aba_cadastro, text='Cadastrar Atividade')

projeto_label = ttk.Label(aba_cadastro, text="Nome do Projeto")
projeto_label.grid(row=0, column=0, padx=10, pady=5)
projeto_entry = ttk.Entry(aba_cadastro)
projeto_entry.grid(row=0, column=1, padx=10, pady=5)

descricao_label = ttk.Label(aba_cadastro, text="Descrição")
descricao_label.grid(row=1, column=0, padx=10, pady=5)
descricao_entry = ttk.Entry(aba_cadastro)
descricao_entry.grid(row=1, column=1, padx=10, pady=5)

cliente_label = ttk.Label(aba_cadastro, text="Cliente")
cliente_label.grid(row=2, column=0, padx=10, pady=5)
cliente_entry = ttk.Entry(aba_cadastro)
cliente_entry.grid(row=2, column=1, padx=10, pady=5)

cadastrar_button = ttk.Button(aba_cadastro, text="Cadastrar", command=cadastrar_atividade)
cadastrar_button.grid(row=3, column=0, columnspan=2, pady=10)

# Aba de registro de horas trabalhadas
aba_registro = ttk.Frame(aba_control)
aba_control.add(aba_registro, text='Registrar Horas')

atividade_label = ttk.Label(aba_registro, text="Selecionar Atividade")
atividade_label.grid(row=0, column=0, padx=10, pady=5)
atividade_combobox = ttk.Combobox(aba_registro)
atividade_combobox.grid(row=0, column=1, padx=10, pady=5)

data_label = ttk.Label(aba_registro, text="Data")
data_label.grid(row=1, column=0, padx=10, pady=5)
data_entry = ttk.Entry(aba_registro)
data_entry.grid(row=1, column=1, padx=10, pady=5)

hora_inicio_label = ttk.Label(aba_registro, text="Hora Início")
hora_inicio_label.grid(row=2, column=0, padx=10, pady=5)
hora_inicio_entry = ttk.Entry(aba_registro)
hora_inicio_entry.grid(row=2, column=1, padx=10, pady=5)

hora_fim_label = ttk.Label(aba_registro, text="Hora Fim")
hora_fim_label.grid(row=3, column=0, padx=10, pady=5)
hora_fim_entry = ttk.Entry(aba_registro)
hora_fim_entry.grid(row=3, column=1, padx=10, pady=5)

registrar_button = ttk.Button(aba_registro, text="Registrar", command=registrar_horas)
registrar_button.grid(row=4, column=0, columnspan=2, pady=10)

# Aba de visualização de resumos
aba_resumo = ttk.Frame(aba_control)
aba_control.add(aba_resumo, text='Visualizar Resumos')

resumo_text = tk.Text(aba_resumo, wrap="word", height=10)
resumo_text.pack(padx=10, pady=10)

visualizar_button = ttk.Button(aba_resumo, text="Visualizar", command=visualizar_resumos)
visualizar_button.pack(pady=10)

# Seleção de banco de dados
menu_bar = tk.Menu(root)
file_menu = tk.Menu(menu_bar, tearoff=0)
file_menu.add_command(label="Selecionar Banco de Dados", command=select_db)
menu_bar.add_cascade(label="Arquivo", menu=file_menu)
root.config(menu=menu_bar)

aba_control.pack(expand=1, fill="both")
root.mainloop()
