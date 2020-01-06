using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class Dropdown : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler
{
    [SerializeField]
    Tasks tasks; // чтобы при наведении на теорию или установку закрылось поле с заданиями практики

    public GameObject panelTrigger;
    RectTransform triggerTransfrom;

    public Button button;
    RectTransform buttonTransfrom;
    Vector2 buttonSize;

    public GameObject dropdownList;
    RectTransform dropdownTransfrom;
    Vector2 dropdownSize;

    public Sprite buttonNormalState;
    public Sprite buttonHighlightedState;

    void Start()
    {
        if (dropdownList != null)
        {
            triggerTransfrom = panelTrigger.GetComponent<RectTransform>();
            buttonTransfrom = button.GetComponent<RectTransform>();
            dropdownTransfrom = dropdownList.GetComponent<RectTransform>();

            buttonSize = buttonTransfrom.sizeDelta;
            dropdownSize = dropdownTransfrom.sizeDelta;

            dropdownTransfrom.sizeDelta = new Vector2(0, 0);
            triggerTransfrom.sizeDelta = buttonSize;

            dropdownList.SetActive(false);
        }

        tasks.Open();
    }

    public void OnPointerEnter(PointerEventData eventData)//когда подсветили
    {
        button.GetComponent<Image>().sprite = buttonHighlightedState;

        tasks.Close();
        dropdownTransfrom.sizeDelta = dropdownSize;
        triggerTransfrom.sizeDelta = buttonSize + dropdownSize;
        dropdownList.SetActive(true);
    }

    public void OnPointerExit(PointerEventData eventData)
    {
        if (dropdownList != null)
        {
            dropdownTransfrom.sizeDelta = new Vector2(0, 0);
            triggerTransfrom.sizeDelta = buttonSize;
            button.GetComponent<Image>().sprite = buttonNormalState;
            ChangeButtonTextOnHover[] mas = dropdownList.GetComponentsInChildren<ChangeButtonTextOnHover>();
            foreach (var item in mas)
            {
                item.PointerOut();
            }

            dropdownList.SetActive(false);
        }
    }
}
