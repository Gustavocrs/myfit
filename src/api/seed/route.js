import {NextResponse} from "next/server";
import {db} from "@/lib/firebase";
import {collection, writeBatch, doc} from "firebase/firestore";
import exercisesData from "@/data/exercises.json";

/**
 * API Route para popular o banco de dados Firestore com os exercícios do JSON.
 * Acesse via GET /api/seed para executar.
 *
 * @param {Request} request
 */
export async function GET(request) {
  try {
    const batch = writeBatch(db);
    const exercisesCollection = collection(db, "exercises");

    exercisesData.forEach((exercise) => {
      const docRef = doc(exercisesCollection, exercise.id);
      batch.set(docRef, exercise);
    });

    await batch.commit();

    return NextResponse.json({
      message: `Banco de dados populado com sucesso! ${exercisesData.length} exercícios adicionados.`,
    });
  } catch (error) {
    console.error("Erro ao popular o banco de dados:", error);
    return NextResponse.json(
      {message: "Erro ao popular o banco de dados.", error: error.message},
      {status: 500},
    );
  }
}
