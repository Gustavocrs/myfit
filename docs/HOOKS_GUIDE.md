# 📚 Guia de Hooks Integrados

Este documento descreve os hooks que foram integrados ou atualizados no projeto MyFit.

## ✅ Hooks Implementados

### 1. **useAuth.jsx**

Hook para gerenciar autenticação Firebase com tratamento avançado de erros.

**Características:**

- Autenticação com Google OAuth
- Error mapping para erros comuns do Firebase
- States: `user`, `loading`, `loginWithGoogle()`, `logout()`

**Uso:**

```javascript
import {useAuth} from "@/hooks/useAuth";

const {user, loading, loginWithGoogle, logout} = useAuth();

const handleLogin = async () => {
  try {
    await loginWithGoogle();
  } catch (error) {
    console.error(error.message);
  }
};
```

**Atualização em `AuthContext.jsx`:**

- O AuthContext agora sincroniza com `useAuth` internamente
- Mantém compatibilidade com código existente
- Adiciona melhor tratamento de erros

---

### 2. **useEscapeKey.jsx**

Hook para fechar modais/diálogos ao pressionar a tecla Escape.

**Características:**

- Listener de teclado para tecla Escape
- Limpeza automática de event listeners
- Callback customizável

**Uso:**

```javascript
import {useEscapeKey} from "@/hooks/useEscapeKey";

const MyModal = () => {
  const [open, setOpen] = useState(false);

  useEscapeKey(() => setOpen(false));

  return <Dialog open={open} />;
};
```

**Integração Atual:**

- ✅ Implementado em `AlertDialog.jsx`
- ✅ Fechar diálogos ao pressionar Escape

---

### 3. **useForm.jsx**

Hook para gerenciar estado de formulários simples (não-aninhados).

**Características:**

- Estado centralizado do formulário
- Validação básica (required, email, minLength)
- Métodos: `setField()`, `validate()`, `reset()`

**Uso:**

```javascript
import {useForm} from "@/hooks/useForm";

const MyForm = () => {
  const form = useForm({nome: "", email: ""});

  const handleChange = (field, value) => {
    form.setField(field, value);
  };

  const handleSubmit = () => {
    if (
      form.validate({
        nome: {required: true},
        email: {email: true},
      })
    ) {
      console.log(form.formData);
    }
  };

  return (
    <form>
      <input
        value={form.formData.nome}
        onChange={(e) => handleChange("nome", e.target.value)}
      />
      {form.errors.nome && <span>{form.errors.nome}</span>}
    </form>
  );
};
```

---

### 4. **useFormNested.jsx** (NEW)

Hook para gerenciar formulários com estrutura aninhada (ex: `bio.peso`, `medidas.torax`).

**Características:**

- Suporte a campos aninhados
- Função `setNestedField(section, field, value)`
- Mesmos recursos de `useForm` (validate, reset)

**Uso:**

```javascript
import {useFormNested} from "@/hooks/useFormNested";

const EvaluationForm = () => {
  const evalForm = useFormNested({
    bio: {peso: "", gordura: ""},
    medidas: {torax: "", cintura: ""},
  });

  const handleWeightChange = (value) => {
    evalForm.setNestedField("bio", "peso", value);
  };

  return (
    <input
      value={evalForm.formData.bio.peso}
      onChange={(e) => handleWeightChange(e.target.value)}
    />
  );
};
```

**Próximo Passo:**

- Refatorar `tracking/page.jsx` para usar `useFormNested`
- Simplificará o `handleNestedChange()` atual

---

### 5. **useRequest.jsx**

Hook para fazer requisições HTTP com autenticação Firebase.

**Características:**

- Métodos: `get()`, `post()`, `patch()`, `put()`, `del()`
- Estados: `loading`, `error`
- Autenticação automática com Bearer token
- Suporte a FormData

**Uso:**

```javascript
import useRequest from "@/hooks/useRequest";

const MyComponent = () => {
  const {get, post, loading, error} = useRequest();

  const fetchData = async () => {
    const {data} = await get("/api/users");
    console.log(data);
  };

  return (
    <button onClick={fetchData}>{loading ? "Carregando..." : "Buscar"}</button>
  );
};
```

---

## 📊 Integração Atual

| Hook            | Arquivo             | Status       | Notas                          |
| --------------- | ------------------- | ------------ | ------------------------------ |
| `useAuth`       | `AuthContext.jsx`   | ✅ Integrado | Substitui AuthProvider pattern |
| `useEscapeKey`  | `AlertDialog.jsx`   | ✅ Integrado | Fechar com Escape              |
| `useForm`       | -                   | 📋 Pronto    | Para formulários simples       |
| `useFormNested` | `tracking/page.jsx` | 📋 Planejado | Refatoração futura             |
| `useRequest`    | -                   | 📋 Pronto    | Para API calls futuras         |

---

## 🎯 Próximos Passos

### Curto Prazo (Alta Prioridade)

1. ✅ Integrar `useEscapeKey` em `AlertDialog`
2. ✅ Corrigir `useAuth` imports no firebase.js
3. 📋 Refatorar `settings/page.jsx` para usar hooks de formulário

### Médio Prazo

4. 📋 Refatorar `tracking/page.jsx` com `useFormNested`
5. 📋 Implementar validação robusta em formulários

### Longo Prazo

6. 📋 Adicionar `useRequest` para futuros endpoints de API
7. 📋 Criar testes unitários para hooks

---

## 🔍 Hooks NÃO Integrados (Motivos)

| Hook                 | Razão                                                         |
| -------------------- | ------------------------------------------------------------- |
| `useCrud.jsx`        | Não aplicável ao MyFit (app especializado, não CRUD genérico) |
| `useHttp.jsx`        | Redundante com `useRequest.jsx` (mais completo)               |
| `useLoggedUser.jsx`  | Duplica funcionalidade de `useAuth`                           |
| `usePermissions.jsx` | Não há sistema de roles/permissões no MyFit                   |

---

## 📝 Exemplo Prático: Refatoração de Form

**Antes (sem hook):**

```javascript
const [formData, setFormData] = useState({nome: "", email: ""});
const [errors, setErrors] = useState({});

const handleChange = (field, value) => {
  setFormData((prev) => ({...prev, [field]: value}));
};
```

**Depois (com hook):**

```javascript
const form = useForm({nome: "", email: ""});

// simples assim:
const handleChange = (field, value) => {
  form.setField(field, value);
};
```

---

## 🚀 Comandos Úteis

```bash
# Verificar se há erros
npm run build

# Verificar tipos (se usar TypeScript)
npm run type-check

# Rodar testes (quando implementados)
npm test -- src/hooks
```
