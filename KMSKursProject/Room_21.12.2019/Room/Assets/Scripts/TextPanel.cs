using UnityEngine;
using UnityEngine.UI;

public class TextPanel : MonoBehaviour
{
    Text text;
    Image img;

    GameObject child;

    void Start()
    {
        text = GetComponentInChildren<Text>();
        img = GetComponent<Image>();
        img.enabled = false;
        child = transform.GetChild(0).gameObject;
        child.SetActive(false);
    }

    public void Open(string message)
    {
        if (message.Length != 0)
        {
            text.text = message;
        }

        img.enabled = true;
        child.SetActive(true);
    }

    public void Open(Sprite image)
    {
        img.enabled = true;
        child.SetActive(true);
    }

    public void Close()
    {
        img.enabled = false;
        child.SetActive(false);
    }
}
