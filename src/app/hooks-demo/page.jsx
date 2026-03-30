"use client";

/**
 * EXEMPLO DE USO DOS NOVOS HOOKS
 *
 * Este arquivo demonstra como usar:
 * - useForm (formulário simples)
 * - useFormNested (formulário aninhado)
 * - useEscapeKey (fechar modal com Escape)
 *
 * Use como referência para refatorar outros componentes.
 */

import {useState} from "react";
import {useForm} from "@/hooks/useForm";
import {useFormNested} from "@/hooks/useFormNested";
import {useEscapeKey} from "@/hooks/useEscapeKey";

// ============================================
// EXEMPLO 1: Formulário Simples com useForm
// ============================================

export const SimpleLoginForm = () => {
  const form = useForm({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação básica
    const isValid = form.validate({
      email: {required: true, email: true},
      password: {required: true, minLength: 6},
    });

    if (isValid) {
      console.log("Form válido:", form.formData);
      // form.reset(); // Limpar após envio
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={form.formData.email}
          onChange={(e) => form.setField("email", e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
        {form.errors.email && (
          <span className="text-red-500">{form.errors.email}</span>
        )}
      </div>

      <div>
        <label htmlFor="password">Senha:</label>
        <input
          id="password"
          type="password"
          value={form.formData.password}
          onChange={(e) => form.setField("password", e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
        {form.errors.password && (
          <span className="text-red-500">{form.errors.password}</span>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Entrar
      </button>
    </form>
  );
};

// ============================================
// EXEMPLO 2: Formulário Aninhado com useFormNested
// ============================================

export const NestedEvaluationForm = () => {
  const evalForm = useFormNested({
    date: new Date().toLocaleDateString("pt-BR"),
    bio: {
      peso: "",
      gorduraCorporal: "",
      massaMuscular: "",
    },
    medidas: {
      torax: "",
      cintura: "",
      abdomen: "",
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = evalForm.validate({
      bio: {
        peso: {required: true},
        gorduraCorporal: {required: true},
      },
      medidas: {
        torax: {required: true},
      },
    });

    if (isValid) {
      console.log("Avaliação válida:", evalForm.formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <h2 className="font-bold">Bio Impedância</h2>

      <div>
        <label htmlFor="peso">Peso (kg):</label>
        <input
          id="peso"
          type="number"
          value={evalForm.formData.bio.peso}
          onChange={(e) =>
            evalForm.setNestedField("bio", "peso", e.target.value)
          }
          className="w-full border rounded px-2 py-1"
          placeholder="00.0"
        />
        {evalForm.errors["bio.peso"] && (
          <span className="text-red-500">{evalForm.errors["bio.peso"]}</span>
        )}
      </div>

      <div>
        <label htmlFor="gordura">Gordura Corporal (%):</label>
        <input
          id="gordura"
          type="number"
          value={evalForm.formData.bio.gorduraCorporal}
          onChange={(e) =>
            evalForm.setNestedField("bio", "gorduraCorporal", e.target.value)
          }
          className="w-full border rounded px-2 py-1"
          placeholder="00.0"
        />
        {evalForm.errors["bio.gorduraCorporal"] && (
          <span className="text-red-500">
            {evalForm.errors["bio.gorduraCorporal"]}
          </span>
        )}
      </div>

      <h2 className="font-bold mt-4">Medidas</h2>

      <div>
        <label htmlFor="torax">Tórax (cm):</label>
        <input
          id="torax"
          type="number"
          value={evalForm.formData.medidas.torax}
          onChange={(e) =>
            evalForm.setNestedField("medidas", "torax", e.target.value)
          }
          className="w-full border rounded px-2 py-1"
          placeholder="00.0"
        />
        {evalForm.errors["medidas.torax"] && (
          <span className="text-red-500">
            {evalForm.errors["medidas.torax"]}
          </span>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded flex-1"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={() => evalForm.reset()}
          className="bg-gray-400 text-white px-4 py-2 rounded flex-1"
        >
          Limpar
        </button>
      </div>
    </form>
  );
};

// ============================================
// EXEMPLO 3: Modal com useEscapeKey
// ============================================

export const ModalWithEscapeKey = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Fechar modal ao pressionar Escape
  useEscapeKey(() => setIsOpen(false));

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Abrir Modal (Pressione ESC para fechar)
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm">
            <h2 className="font-bold mb-4">Modal Exemplo</h2>
            <p className="mb-4">Você pode fechar este modal:</p>
            <ul className="list-disc list-inside mb-4">
              <li>Clicando no botão Fechar</li>
              <li>Pressionar a tecla ESC</li>
            </ul>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// EXEMPLO 4: Combinado (Form + Modal + Escape)
// ============================================

export const CombinedExample = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const form = useForm({message: ""});

  useEscapeKey(() => setIsModalOpen(false));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.formData.message.trim()) {
      alert(`Mensagem: ${form.formData.message}`);
      form.reset();
      setIsModalOpen(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Enviar Mensagem
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded shadow-lg max-w-sm"
          >
            <h2 className="font-bold mb-4">Enviar Mensagem</h2>

            <textarea
              value={form.formData.message}
              onChange={(e) => form.setField("message", e.target.value)}
              className="w-full border rounded px-2 py-1 mb-4"
              rows="4"
              placeholder="Digite sua mensagem..."
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded flex-1"
              >
                Enviar
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded flex-1"
              >
                Cancelar
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Pressione ESC para fechar
            </p>
          </form>
        </div>
      )}
    </div>
  );
};

// Export como página demo
export default function HooksExamplePage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-8">Exemplos de Hooks</h1>

        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">1. Formulário Simples</h2>
          <SimpleLoginForm />
        </section>

        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">2. Formulário Aninhado</h2>
          <NestedEvaluationForm />
        </section>

        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">3. Modal com Escape Key</h2>
          <ModalWithEscapeKey />
        </section>

        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">4. Exemplo Combinado</h2>
          <CombinedExample />
        </section>
      </div>
    </div>
  );
}
