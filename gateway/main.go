package main

import (
	"context"
	"encoding/json"
	"log"
	"os"

	"github.com/diamondburned/arikawa/v3/gateway"
	"github.com/diamondburned/arikawa/v3/session"
	"github.com/diamondburned/arikawa/v3/utils/handler"
	"github.com/diamondburned/arikawa/v3/utils/ws"
	"github.com/joho/godotenv"
	"github.com/streadway/amqp"
)

func main() {
	log.Println("Starting...")
	// Load env variables
	err := godotenv.Load("../.env")
	if err != nil {
		log.Fatalf("error loading env: ", err)
	}
	token := os.Getenv("BOT_TOKEN")
	amqpUri := os.Getenv("AMQP_URI")

	// Connect to rabbitmq
    amqpConn, err := amqp.Dial(amqpUri)
    if err != nil {
        log.Fatalf("failed to connect to amqp: ", err)
    }
    defer amqpConn.Close()
    channel, err := amqpConn.Channel()
    if err != nil {
        log.Fatalf("failed to create amqp channel:", err)
    }
    defer channel.Close()

	// Create bot session
	gW, err := gateway.New(context.Background(), "Bot " + token)
    if err != nil {
        log.Fatalf("error creating gateway: ", err)
    }
    gW.AddIntents(gateway.IntentGuildMessages)
    s := session.NewWithGateway(gW, new(handler.Handler))
    events := gW.Connect(context.Background())
    defer s.Close()
    setupEvents(channel, events)

	log.Println("Started")

	// Block
	select {}
}

func setupEvents(channel *amqp.Channel, events <-chan ws.Op) {
	eQueue, err := channel.QueueDeclare("events", true, false, false, false, nil)
    if err != nil {
        log.Fatalf("error declaring queue: ", err)
    }
    err = channel.ExchangeDeclare("events_fanout", "fanout", true, false, false, false, nil)
    if err != nil {
        log.Fatalf("error declaring exchange: ", err)
    }

    go func() {
        for event := range events {
			// We only want to send relevant events, the client doesn't and shouldn't care about the connection
			if event.Code != 0 || event.Type == "READY" || event.Type == "RESUMED" {
				continue
			}

			bytes, err := json.Marshal(event)
            if err != nil {
                log.Printf("error marshalling event: ", err)
            }

            // We want all clients to recieve interaction events
            if event.Type == "INTERACTION_CREATE" {
                err = channel.Publish("events_fanout", "", false, false, amqp.Publishing{
                    ContentType: "application/json",
                    Body:        bytes,
                })
            } else {
                err = channel.Publish("", eQueue.Name, false, false, amqp.Publishing{
                    ContentType: "application/json",
                    Body:        bytes,
                })
            }

            if err != nil {
                log.Printf("error publishing event: ", err)
            }
            log.Printf("%v", string(bytes[:]))
        }
    }()
}