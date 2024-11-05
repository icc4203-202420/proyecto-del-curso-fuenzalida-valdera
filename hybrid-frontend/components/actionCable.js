import { createConsumer } from "@rails/actioncable";

// Asegúrate de cambiar 'localhost:3000' por la dirección de tu servidor Rails
const cable = createConsumer("ws://localhost:3000/cable");

export default cable;