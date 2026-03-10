#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <locale.h>

#define MAX_CLIENTES 100
#define TAM_NOME 50
#define TAM_CPF 15
#define TAM_SENHA 20

typedef struct {
    int numero_conta;
    char nome[TAM_NOME];
    char cpf[TAM_CPF];
    char senha[TAM_SENHA];
    float saldo;
    int ativo;
} Conta;

Conta contas[MAX_CLIENTES];
int total_contas = 0;

void limpar_tela() {
    system("cls || clear");
}

void pausar() {
    printf("\nPressione Enter para continuar...");
    getchar();
    getchar();
}

int gerar_numero_conta() {
    return 1000 + total_contas;
}

void criar_conta() {
    limpar_tela();
    printf("=== CRIAR NOVA CONTA ===\n\n");
    
    if (total_contas >= MAX_CLIENTES) {
        printf("Limite máximo de contas atingido!\n");
        pausar();
        return;
    }
    
    Conta nova_conta;
    nova_conta.numero_conta = gerar_numero_conta();
    nova_conta.saldo = 0.0;
    nova_conta.ativo = 1;
    
    printf("Número da conta: %d\n", nova_conta.numero_conta);
    printf("Nome: ");
    scanf(" %[^\n]", nova_conta.nome);
    printf("CPF: ");
    scanf(" %[^\n]", nova_conta.cpf);
    printf("Senha: ");
    scanf(" %[^\n]", nova_conta.senha);
    
    contas[total_contas] = nova_conta;
    total_contas++;
    
    printf("\nConta criada com sucesso!\n");
    printf("Número da conta: %d\n", nova_conta.numero_conta);
    pausar();
}

int buscar_conta(int numero_conta, char* senha) {
    for (int i = 0; i < total_contas; i++) {
        if (contas[i].numero_conta == numero_conta && contas[i].ativo) {
            if (strcmp(contas[i].senha, senha) == 0) {
                return i;
            }
        }
    }
    return -1;
}

void depositar() {
    limpar_tela();
    printf("=== DEPOSITAR ===\n\n");
    
    int num_conta;
    float valor;
    
    printf("Número da conta: ");
    scanf("%d", &num_conta);
    
    int indice = -1;
    for (int i = 0; i < total_contas; i++) {
        if (contas[i].numero_conta == num_conta && contas[i].ativo) {
            indice = i;
            break;
        }
    }
    
    if (indice == -1) {
        printf("Conta não encontrada!\n");
        pausar();
        return;
    }
    
    printf("Valor do depósito: R$ ");
    scanf("%f", &valor);
    
    if (valor <= 0) {
        printf("Valor inválido!\n");
        pausar();
        return;
    }
    
    contas[indice].saldo += valor;
    printf("\nDepósito realizado com sucesso!\n");
    printf("Novo saldo: R$ %.2f\n", contas[indice].saldo);
    pausar();
}

void sacar() {
    limpar_tela();
    printf("=== SACAR ===\n\n");
    
    int num_conta;
    char senha[TAM_SENHA];
    float valor;
    
    printf("Número da conta: ");
    scanf("%d", &num_conta);
    printf("Senha: ");
    scanf(" %[^\n]", senha);
    
    int indice = buscar_conta(num_conta, senha);
    
    if (indice == -1) {
        printf("Conta não encontrada ou senha incorreta!\n");
        pausar();
        return;
    }
    
    printf("Valor do saque: R$ ");
    scanf("%f", &valor);
    
    if (valor <= 0) {
        printf("Valor inválido!\n");
        pausar();
        return;
    }
    
    if (valor > contas[indice].saldo) {
        printf("Saldo insuficiente!\n");
        printf("Saldo atual: R$ %.2f\n", contas[indice].saldo);
        pausar();
        return;
    }
    
    contas[indice].saldo -= valor;
    printf("\nSaque realizado com sucesso!\n");
    printf("Novo saldo: R$ %.2f\n", contas[indice].saldo);
    pausar();
}

void consultar_saldo() {
    limpar_tela();
    printf("=== CONSULTAR SALDO ===\n\n");
    
    int num_conta;
    char senha[TAM_SENHA];
    
    printf("Número da conta: ");
    scanf("%d", &num_conta);
    printf("Senha: ");
    scanf(" %[^\n]", senha);
    
    int indice = buscar_conta(num_conta, senha);
    
    if (indice == -1) {
        printf("Conta não encontrada ou senha incorreta!\n");
        pausar();
        return;
    }
    
    printf("\n=== DADOS DA CONTA ===\n");
    printf("Número: %d\n", contas[indice].numero_conta);
    printf("Titular: %s\n", contas[indice].nome);
    printf("CPF: %s\n", contas[indice].cpf);
    printf("Saldo: R$ %.2f\n", contas[indice].saldo);
    pausar();
}

void transferir() {
    limpar_tela();
    printf("=== TRANSFERIR ===\n\n");
    
    int conta_origem, conta_destino;
    char senha[TAM_SENHA];
    float valor;
    
    printf("Conta de origem: ");
    scanf("%d", &conta_origem);
    printf("Senha: ");
    scanf(" %[^\n]", senha);
    
    int indice_origem = buscar_conta(conta_origem, senha);
    
    if (indice_origem == -1) {
        printf("Conta de origem não encontrada ou senha incorreta!\n");
        pausar();
        return;
    }
    
    printf("Conta de destino: ");
    scanf("%d", &conta_destino);
    
    int indice_destino = -1;
    for (int i = 0; i < total_contas; i++) {
        if (contas[i].numero_conta == conta_destino && contas[i].ativo) {
            indice_destino = i;
            break;
        }
    }
    
    if (indice_destino == -1) {
        printf("Conta de destino não encontrada!\n");
        pausar();
        return;
    }
    
    printf("Valor da transferência: R$ ");
    scanf("%f", &valor);
    
    if (valor <= 0) {
        printf("Valor inválido!\n");
        pausar();
        return;
    }
    
    if (valor > contas[indice_origem].saldo) {
        printf("Saldo insuficiente!\n");
        printf("Saldo atual: R$ %.2f\n", contas[indice_origem].saldo);
        pausar();
        return;
    }
    
    contas[indice_origem].saldo -= valor;
    contas[indice_destino].saldo += valor;
    
    printf("\nTransferência realizada com sucesso!\n");
    printf("Novo saldo da conta de origem: R$ %.2f\n", contas[indice_origem].saldo);
    pausar();
}

void encerrar_conta() {
    limpar_tela();
    printf("=== ENCERRAR CONTA ===\n\n");
    
    int num_conta;
    char senha[TAM_SENHA];
    
    printf("Número da conta: ");
    scanf("%d", &num_conta);
    printf("Senha: ");
    scanf(" %[^\n]", senha);
    
    int indice = buscar_conta(num_conta, senha);
    
    if (indice == -1) {
        printf("Conta não encontrada ou senha incorreta!\n");
        pausar();
        return;
    }
    
    if (contas[indice].saldo > 0) {
        printf("A conta possui saldo de R$ %.2f\n", contas[indice].saldo);
        printf("Efetue o saque antes de encerrar a conta.\n");
        pausar();
        return;
    }
    
    contas[indice].ativo = 0;
    printf("\nConta encerrada com sucesso!\n");
    pausar();
}

void listar_contas() {
    limpar_tela();
    printf("=== LISTA DE CONTAS ATIVAS ===\n\n");
    
    int contas_ativas = 0;
    for (int i = 0; i < total_contas; i++) {
        if (contas[i].ativo) {
            printf("Conta: %d | Titular: %s | CPF: %s | Saldo: R$ %.2f\n", 
                   contas[i].numero_conta, contas[i].nome, contas[i].cpf, contas[i].saldo);
            contas_ativas++;
        }
    }
    
    if (contas_ativas == 0) {
        printf("Nenhuma conta ativa encontrada.\n");
    } else {
        printf("\nTotal de contas ativas: %d\n", contas_ativas);
    }
    
    pausar();
}

int main() {
    setlocale(LC_ALL, "Portuguese");
    int opcao;
    
    do {
        limpar_tela();
        printf("=== SISTEMA BANCÁRIO ===\n\n");
        printf("1 - Criar conta\n");
        printf("2 - Depositar\n");
        printf("3 - Sacar\n");
        printf("4 - Consultar saldo\n");
        printf("5 - Transferir\n");
        printf("6 - Encerrar conta\n");
        printf("7 - Listar contas\n");
        printf("0 - Sair\n\n");
        printf("Escolha uma opção: ");
        scanf("%d", &opcao);
        
        switch(opcao) {
            case 1:
                criar_conta();
                break;
            case 2:
                depositar();
                break;
            case 3:
                sacar();
                break;
            case 4:
                consultar_saldo();
                break;
            case 5:
                transferir();
                break;
            case 6:
                encerrar_conta();
                break;
            case 7:
                listar_contas();
                break;
            case 0:
                printf("\nSaindo do sistema...\n");
                break;
            default:
                printf("\nOpção inválida!\n");
                pausar();
        }
    } while(opcao != 0);
    
    return 0;
}
