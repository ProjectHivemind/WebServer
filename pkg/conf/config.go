package conf

import (
	"io/ioutil"
	"log"

	"gopkg.in/yaml.v2"
)

type ConfOptions struct {
	Webserver map[string]string `yaml:"webserver"`
	Restapi   map[string]string `yaml:"restapi"`
}

func (c *ConfOptions) GetConf(path string) {
	yamlFile, err := ioutil.ReadFile(path)
	if err != nil {
		log.Printf("yamlFile.Get err   #%v ", err)
		return
	}

	err = yaml.Unmarshal(yamlFile, &c)
	if err != nil {
		log.Fatalf("Unmarshal: %v", err)
	}
}
