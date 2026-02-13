# Page snapshot

```yaml
- generic:
  - generic:
    - generic:
      - generic:
        - button:
          - img
          - text: Dark Mode
      - list
  - dialog "Create Ping/Post Delivery Method" [ref=e2]:
    - generic [ref=e3]:
      - heading "Create Ping/Post Delivery Method" [level=2] [ref=e4]
      - button "Close" [ref=e5]:
        - img
    - generic [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8]: Description
        - textbox "e.g., Acme Corp Mortgage Ping/Post" [ref=e10]
      - generic [ref=e11]:
        - generic [ref=e12]: Lead Type*
        - generic [ref=e13]:
          - combobox [ref=e14]:
            - generic: Select lead type
            - img [ref=e15]
          - paragraph [ref=e17]: Select lead type
    - generic [ref=e19]:
      - button "Back" [ref=e20]
      - generic [ref=e21]:
        - button "Cancel" [ref=e22]
        - button "Create" [active] [ref=e23]
```